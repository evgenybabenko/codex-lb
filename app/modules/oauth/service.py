from __future__ import annotations

import asyncio
import logging
import secrets
import time
from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Awaitable, Callable

from aiohttp import web

from app.core.auth import (
    DEFAULT_EMAIL,
    DEFAULT_PLAN,
    OpenAIAuthClaims,
    extract_id_token_claims,
    generate_unique_account_id,
    workspace_identity_from_claims,
)
from app.core.clients.oauth import (
    OAuthError,
    OAuthTokens,
    build_authorization_url,
    exchange_authorization_code,
    exchange_device_token,
    generate_pkce_pair,
    request_device_code,
)
from app.core.config.settings import get_settings
from app.core.crypto import TokenEncryptor
from app.core.plan_types import coerce_account_plan_type
from app.core.utils.time import utcnow
from app.db.models import Account, AccountStatus
from app.modules.accounts.identity_metadata import backfill_account_identity_metadata_for_email
from app.modules.accounts.repository import AccountIdentityConflictError, AccountsRepository
from app.modules.oauth.schemas import (
    ManualCallbackResponse,
    OauthCompleteRequest,
    OauthCompleteResponse,
    OauthStartRequest,
    OauthStartResponse,
    OauthStatusResponse,
)

_async_sleep = asyncio.sleep
_SUCCESS_TEMPLATE = Path(__file__).resolve().parent / "templates" / "oauth_success.html"
_MAX_PENDING_BROWSER_FLOWS = 16
_PENDING_BROWSER_FLOW_TTL_SECONDS = 15 * 60
_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class PendingBrowserFlow:
    code_verifier: str
    created_at: float


@dataclass
class OAuthState:
    status: str = "pending"
    method: str | None = None
    error_message: str | None = None
    state_token: str | None = None
    code_verifier: str | None = None
    device_auth_id: str | None = None
    user_code: str | None = None
    interval_seconds: int | None = None
    expires_at: float | None = None
    callback_server: "OAuthCallbackServer | None" = None
    poll_task: asyncio.Task[None] | None = None
    browser_flows: dict[str, PendingBrowserFlow] = field(default_factory=dict)


class OAuthStateStore:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._state = OAuthState(status="idle")

    @property
    def lock(self) -> asyncio.Lock:
        return self._lock

    @property
    def state(self) -> OAuthState:
        return self._state

    async def reset(self) -> None:
        async with self._lock:
            await self._cleanup_locked()
            self._state = OAuthState(status="idle")

    async def _cleanup_locked(self) -> None:
        task = self._state.poll_task
        if task and not task.done():
            task.cancel()
        server = self._state.callback_server
        if server:
            await server.stop()


class OAuthCallbackServer:
    def __init__(
        self,
        handler: Callable[[web.Request], Awaitable[web.StreamResponse]],
        host: str = "127.0.0.1",
        port: int = 1455,
    ) -> None:
        self._handler = handler
        self._host = host
        self._port = port
        self._runner: web.AppRunner | None = None
        self._site: web.TCPSite | None = None

    async def start(self) -> None:
        app = web.Application()
        app.router.add_get("/auth/callback", self._handler)
        self._runner = web.AppRunner(app)
        await self._runner.setup()
        self._site = web.TCPSite(self._runner, self._host, self._port)
        await self._site.start()

    async def stop(self) -> None:
        if self._runner:
            await self._runner.cleanup()
        self._runner = None
        self._site = None


_OAUTH_STORE = OAuthStateStore()


class OauthService:
    def __init__(
        self,
        accounts_repo: AccountsRepository,
        repo_factory: Callable[[], AbstractAsyncContextManager[AccountsRepository]] | None = None,
    ) -> None:
        self._accounts_repo = accounts_repo
        self._encryptor = TokenEncryptor()
        self._store = _OAUTH_STORE
        self._repo_factory = repo_factory

    async def start_oauth(self, request: OauthStartRequest) -> OauthStartResponse:
        force_method = (request.force_method or "").lower()
        if force_method == "device":
            return await self._start_device_flow()

        try:
            return await self._start_browser_flow()
        except OSError:
            return await self._start_device_flow()

    async def oauth_status(self) -> OauthStatusResponse:
        async with self._store.lock:
            state = self._store.state
            status = state.status if state.status != "idle" else "pending"
            return OauthStatusResponse(status=status, error_message=state.error_message)

    async def complete_oauth(self, request: OauthCompleteRequest | None = None) -> OauthCompleteResponse:
        payload = request or OauthCompleteRequest()
        async with self._store.lock:
            state = self._store.state
            if payload.device_auth_id:
                state.device_auth_id = payload.device_auth_id
            if payload.user_code:
                state.user_code = payload.user_code
            if state.status == "success":
                return OauthCompleteResponse(status="success")
            if state.method != "device":
                return OauthCompleteResponse(status="pending")
            if state.poll_task and not state.poll_task.done():
                return OauthCompleteResponse(status="pending")
            if not state.device_auth_id or not state.user_code or not state.expires_at:
                state.status = "error"
                state.error_message = "Device code flow is not initialized."
                return OauthCompleteResponse(status="error")

            interval = state.interval_seconds if state.interval_seconds is not None else 0
            interval = max(interval, 0)
            poll_context = DevicePollContext(
                device_auth_id=state.device_auth_id,
                user_code=state.user_code,
                interval_seconds=interval,
                expires_at=state.expires_at,
            )
            state.poll_task = asyncio.create_task(self._poll_device_tokens(poll_context))
            return OauthCompleteResponse(status="pending")

    async def _start_browser_flow(self) -> OauthStartResponse:
        code_verifier, code_challenge = generate_pkce_pair()
        state_token = secrets.token_urlsafe(16)
        authorization_url = build_authorization_url(state=state_token, code_challenge=code_challenge)
        settings = get_settings()

        callback_server: OAuthCallbackServer | None = None
        poll_task: asyncio.Task[None] | None = None
        async with self._store.lock:
            state = self._store.state
            poll_task = state.poll_task if state.poll_task and not state.poll_task.done() else None
            state.poll_task = None
            state.status = "pending"
            state.method = "browser"
            state.state_token = state_token
            state.code_verifier = code_verifier
            state.device_auth_id = None
            state.user_code = None
            state.interval_seconds = None
            state.expires_at = None
            state.error_message = None
            self._remember_browser_flow_locked(state, state_token, code_verifier)
            callback_server = state.callback_server

        if poll_task:
            poll_task.cancel()

        if callback_server is None:
            callback_server = OAuthCallbackServer(
                self._handle_callback,
                host=settings.oauth_callback_host,
                port=settings.oauth_callback_port,
            )
            try:
                await callback_server.start()
                async with self._store.lock:
                    self._store.state.callback_server = callback_server
            except OSError:
                _LOGGER.exception(
                    "oauth.browser.start_failed host=%s port=%s state=%s",
                    settings.oauth_callback_host,
                    settings.oauth_callback_port,
                    state_token[:8],
                )
                raise

        _LOGGER.info(
            "oauth.browser.started host=%s port=%s state=%s",
            settings.oauth_callback_host,
            settings.oauth_callback_port,
            state_token[:8],
        )

        return OauthStartResponse(
            method="browser",
            authorization_url=authorization_url,
            callback_url=settings.oauth_redirect_uri,
        )

    async def manual_callback(self, callback_url: str) -> ManualCallbackResponse:
        """Process an OAuth callback URL pasted manually by the user.

        This is useful when the server is accessed remotely and the
        OAuth callback (localhost:1455) is not reachable from the
        user's browser.
        """
        from urllib.parse import parse_qs, urlparse

        parsed = urlparse(callback_url)
        params = parse_qs(parsed.query)

        error = params.get("error", [None])[0]
        code = params.get("code", [None])[0]
        state = params.get("state", [None])[0]

        if error:
            _LOGGER.warning("oauth.browser.callback.manual_error error=%s", error)
            message = f"OAuth error: {error}"
            await self._set_error(message)
            return ManualCallbackResponse(status="error", error_message=message)

        async with self._store.lock:
            verifier = self._lookup_browser_flow_locked(self._store.state, state)

        if not code or not state or not verifier:
            _LOGGER.warning(
                "oauth.browser.callback.manual_invalid state=%s has_code=%s",
                (state or "")[:8],
                bool(code),
            )
            message = "Invalid OAuth callback: state mismatch or missing code."
            await self._set_error(message)
            return ManualCallbackResponse(status="error", error_message=message)

        try:
            tokens = await exchange_authorization_code(code=code, code_verifier=verifier)
            await self._persist_tokens(tokens)
            await self._consume_browser_flow(state)
            await self._set_success()
            _LOGGER.info("oauth.browser.callback.manual_success state=%s", state[:8])
            return ManualCallbackResponse(status="success")
        except OAuthError as exc:
            _LOGGER.warning("oauth.browser.callback.manual_exchange_failed state=%s error=%s", state[:8], exc.message)
            await self._set_error(exc.message)
            return ManualCallbackResponse(status="error", error_message=exc.message)
        except AccountIdentityConflictError as exc:
            message = str(exc)
            _LOGGER.warning("oauth.browser.callback.manual_conflict state=%s error=%s", state[:8], message)
            await self._set_error(message)
            return ManualCallbackResponse(status="error", error_message=message)
        except Exception as exc:
            message = f"Unexpected error: {exc}"
            _LOGGER.exception("oauth.browser.callback.manual_unexpected state=%s", state[:8])
            await self._set_error(message)
            return ManualCallbackResponse(status="error", error_message=message)

    async def _start_device_flow(self) -> OauthStartResponse:
        await self._store.reset()
        try:
            device = await request_device_code()
        except OAuthError as exc:
            await self._set_error(exc.message)
            raise

        async with self._store.lock:
            state = self._store.state
            state.status = "pending"
            state.method = "device"
            state.device_auth_id = device.device_auth_id
            state.user_code = device.user_code
            state.interval_seconds = device.interval_seconds
            state.expires_at = time.time() + device.expires_in_seconds
            state.error_message = None

        return OauthStartResponse(
            method="device",
            verification_url=device.verification_url,
            user_code=device.user_code,
            device_auth_id=device.device_auth_id,
            interval_seconds=device.interval_seconds,
            expires_in_seconds=device.expires_in_seconds,
        )

    async def _handle_callback(self, request: web.Request) -> web.Response:
        params = request.rel_url.query
        error = params.get("error")
        code = params.get("code")
        state = params.get("state")

        if error:
            _LOGGER.warning("oauth.browser.callback.error state=%s error=%s", (state or "")[:8], error)
            await self._set_error(f"OAuth error: {error}")
            return self._html_response(_error_html("Authorization failed."))

        async with self._store.lock:
            verifier = self._lookup_browser_flow_locked(self._store.state, state)

        if not code or not state or not verifier:
            _LOGGER.warning(
                "oauth.browser.callback.invalid state=%s has_code=%s",
                (state or "")[:8],
                bool(code),
            )
            return self._html_response(
                _error_html("This OAuth callback is invalid or has expired. Start sign-in again from the dashboard."),
            )

        try:
            tokens = await exchange_authorization_code(code=code, code_verifier=verifier)
            await self._persist_tokens(tokens)
            await self._consume_browser_flow(state)
            await self._set_success()
            _LOGGER.info("oauth.browser.callback.success state=%s", state[:8])
            html = _success_html()
        except OAuthError as exc:
            _LOGGER.warning("oauth.browser.callback.exchange_failed state=%s error=%s", state[:8], exc.message)
            await self._set_error(exc.message)
            html = _error_html(exc.message)
        except AccountIdentityConflictError as exc:
            _LOGGER.warning("oauth.browser.callback.conflict state=%s error=%s", state[:8], str(exc))
            await self._set_error(str(exc))
            html = _error_html(str(exc))
        return self._html_response(html)

    async def _poll_device_tokens(self, context: "DevicePollContext") -> None:
        try:
            while time.time() < context.expires_at:
                tokens = await exchange_device_token(
                    device_auth_id=context.device_auth_id,
                    user_code=context.user_code,
                )
                if tokens:
                    await self._persist_tokens(tokens)
                    await self._set_success()
                    return
                await _async_sleep(context.interval_seconds)
            await self._set_error("Device code expired.")
        except OAuthError as exc:
            await self._set_error(exc.message)
        except AccountIdentityConflictError as exc:
            await self._set_error(str(exc))
        finally:
            async with self._store.lock:
                current = asyncio.current_task()
                if self._store.state.poll_task is current:
                    self._store.state.poll_task = None

    async def _persist_tokens(self, tokens: OAuthTokens) -> None:
        claims = extract_id_token_claims(tokens.id_token)
        auth_claims = claims.auth or OpenAIAuthClaims()
        raw_account_id = auth_claims.chatgpt_account_id or claims.chatgpt_account_id
        email = claims.email or DEFAULT_EMAIL
        workspace_id, workspace_name = workspace_identity_from_claims(claims)
        account_id = generate_unique_account_id(raw_account_id, email, workspace_id)
        plan_type = coerce_account_plan_type(
            auth_claims.chatgpt_plan_type or claims.chatgpt_plan_type,
            DEFAULT_PLAN,
        )
        _LOGGER.info(
            "oauth.persist_tokens email=%s raw_account_id=%s workspace_id=%s plan_type=%s",
            email,
            raw_account_id,
            workspace_id,
            plan_type,
        )

        account = Account(
            id=account_id,
            chatgpt_account_id=raw_account_id,
            workspace_id=workspace_id,
            workspace_name=workspace_name,
            email=email,
            plan_type=plan_type,
            access_token_encrypted=self._encryptor.encrypt(tokens.access_token),
            refresh_token_encrypted=self._encryptor.encrypt(tokens.refresh_token),
            id_token_encrypted=self._encryptor.encrypt(tokens.id_token),
            last_refresh=utcnow(),
            status=AccountStatus.ACTIVE,
            deactivation_reason=None,
        )
        if self._repo_factory:
            async with self._repo_factory() as repo:
                await backfill_account_identity_metadata_for_email(repo, self._encryptor, email)
                await repo.upsert(account)
        else:
            await backfill_account_identity_metadata_for_email(self._accounts_repo, self._encryptor, email)
            await self._accounts_repo.upsert(account)

    async def _set_success(self) -> None:
        async with self._store.lock:
            self._store.state.status = "success"
            self._store.state.error_message = None

    async def _set_error(self, message: str) -> None:
        async with self._store.lock:
            self._store.state.status = "error"
            self._store.state.error_message = message

    async def _stop_callback_server(self) -> None:
        async with self._store.lock:
            server = self._store.state.callback_server
            self._store.state.callback_server = None
        if server:
            await server.stop()

    @staticmethod
    def _remember_browser_flow_locked(state: OAuthState, state_token: str, code_verifier: str) -> None:
        OauthService._prune_browser_flows_locked(state)
        state.browser_flows[state_token] = PendingBrowserFlow(
            code_verifier=code_verifier,
            created_at=time.time(),
        )

        if len(state.browser_flows) <= _MAX_PENDING_BROWSER_FLOWS:
            return

        oldest_tokens = sorted(
            state.browser_flows.items(),
            key=lambda item: item[1].created_at,
        )[: len(state.browser_flows) - _MAX_PENDING_BROWSER_FLOWS]
        for token, _ in oldest_tokens:
            state.browser_flows.pop(token, None)

    @staticmethod
    def _prune_browser_flows_locked(state: OAuthState) -> None:
        cutoff = time.time() - _PENDING_BROWSER_FLOW_TTL_SECONDS
        expired_tokens = [token for token, flow in state.browser_flows.items() if flow.created_at < cutoff]
        for token in expired_tokens:
            state.browser_flows.pop(token, None)

    @staticmethod
    def _lookup_browser_flow_locked(state: OAuthState, state_token: str | None) -> str | None:
        if not state_token:
            return None

        OauthService._prune_browser_flows_locked(state)
        flow = state.browser_flows.get(state_token)
        return flow.code_verifier if flow else None

    async def _consume_browser_flow(self, state_token: str) -> None:
        async with self._store.lock:
            self._store.state.browser_flows.pop(state_token, None)

    @staticmethod
    def _html_response(html: str) -> web.Response:
        return web.Response(text=html, content_type="text/html")


@dataclass(frozen=True)
class DevicePollContext:
    device_auth_id: str
    user_code: str
    interval_seconds: int
    expires_at: float


def _success_html() -> str:
    try:
        return _SUCCESS_TEMPLATE.read_text(encoding="utf-8")
    except OSError:
        return "<html><body><h1>Login complete</h1><p>Return to the dashboard.</p></body></html>"


def _error_html(message: str) -> str:
    return f"<html><body><h1>Login failed</h1><p>{message}</p></body></html>"

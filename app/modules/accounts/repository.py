from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import delete, func, select, text, update
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Account, AccountStatus, DashboardSettings, RequestLog, StickySession, UsageHistory

_SETTINGS_ROW_ID = 1
_DUPLICATE_ACCOUNT_SUFFIX = "__copy"


@dataclass(frozen=True, slots=True)
class AccountRequestUsageSummary:
    request_count: int
    total_tokens: int
    cached_input_tokens: int
    total_cost_usd: float


class AccountIdentityConflictError(Exception):
    def __init__(self, email: str) -> None:
        self.email = email
        super().__init__(
            f"Cannot overwrite account for email '{email}' because multiple matching accounts exist. "
            "Remove duplicates or enable import without overwrite."
        )


class AccountsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, account_id: str) -> Account | None:
        return await self._session.get(Account, account_id)

    async def list_accounts(self) -> list[Account]:
        result = await self._session.execute(
            select(Account).order_by(
                Account.email,
                func.coalesce(Account.workspace_name, Account.workspace_id, Account.id),
            )
        )
        return list(result.scalars().all())

    async def list_accounts_by_email(self, email: str) -> list[Account]:
        result = await self._session.execute(
            select(Account).where(Account.email == email).order_by(Account.created_at.asc(), Account.id.asc())
        )
        return list(result.scalars().all())

    async def list_request_usage_summary_by_account(
        self,
        account_ids: list[str] | None = None,
    ) -> dict[str, AccountRequestUsageSummary]:
        summaries: dict[str, AccountRequestUsageSummary] = {}
        output_tokens_expr = func.coalesce(RequestLog.output_tokens, RequestLog.reasoning_tokens, 0)
        stmt = select(
            RequestLog.account_id,
            func.count(RequestLog.id).label("request_count"),
            func.coalesce(func.sum(RequestLog.input_tokens), 0).label("input_tokens"),
            func.coalesce(func.sum(output_tokens_expr), 0).label("output_tokens"),
            func.coalesce(func.sum(RequestLog.cached_input_tokens), 0).label("cached_input_tokens"),
            func.coalesce(func.sum(RequestLog.cost_usd), 0.0).label("total_cost_usd"),
        ).group_by(RequestLog.account_id)
        if account_ids:
            stmt = stmt.where(RequestLog.account_id.in_(account_ids))

        result = await self._session.execute(stmt)
        for (
            account_id,
            request_count,
            input_tokens,
            output_tokens,
            cached_input_tokens,
            total_cost_usd,
        ) in result.all():
            if not account_id:
                continue
            input_sum = int(input_tokens or 0)
            output_sum = int(output_tokens or 0)
            cached_sum = int(cached_input_tokens or 0)
            cached_sum = max(0, min(cached_sum, input_sum))
            return_row = AccountRequestUsageSummary(
                request_count=int(request_count or 0),
                total_tokens=input_sum + output_sum,
                cached_input_tokens=cached_sum,
                total_cost_usd=round(float(total_cost_usd or 0.0), 6),
            )
            summaries[account_id] = return_row

        return summaries

    async def exists_active_chatgpt_account_id(self, chatgpt_account_id: str) -> bool:
        result = await self._session.execute(
            select(Account.id)
            .where(Account.chatgpt_account_id == chatgpt_account_id)
            .where(Account.status.notin_((AccountStatus.DEACTIVATED, AccountStatus.PAUSED)))
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def upsert(self, account: Account, *, merge_by_email: bool | None = None) -> Account:
        dialect_name = self._dialect_name()
        sqlite_lock_acquired = False
        if merge_by_email is None:
            if dialect_name == "sqlite":
                await self._acquire_sqlite_merge_lock()
                sqlite_lock_acquired = True
            merge_by_email = await self._merge_by_email_enabled()

        if merge_by_email:
            if dialect_name == "sqlite" and not sqlite_lock_acquired:
                await self._acquire_sqlite_merge_lock()
            elif dialect_name == "postgresql":
                await self._acquire_postgresql_merge_lock(account.email)
        else:
            if dialect_name == "sqlite" and not sqlite_lock_acquired:
                await self._acquire_sqlite_merge_lock()
            elif dialect_name == "postgresql":
                await self._acquire_postgresql_identity_lock(account.id)

        existing = await self._session.get(Account, account.id)
        if existing:
            if merge_by_email:
                _apply_account_updates(existing, account)
                await self._session.commit()
                await self._session.refresh(existing)
                return existing
            account.id = await self._next_available_account_id(account.id)

        if merge_by_email:
            existing_by_workspace = await self._single_account_by_email_and_workspace(
                account.email,
                account.workspace_id,
                chatgpt_account_id=account.chatgpt_account_id,
                account_id=account.id,
            )
            if existing_by_workspace and _can_merge_account_identity(existing_by_workspace, account):
                _apply_account_updates(existing_by_workspace, account)
                await self._session.commit()
                await self._session.refresh(existing_by_workspace)
                return existing_by_workspace
            if account.workspace_id:
                legacy_match = await self._single_account_by_email_without_workspace(account.email)
                if legacy_match and _can_merge_account_identity(legacy_match, account):
                    _apply_account_updates(legacy_match, account)
                    await self._session.commit()
                    await self._session.refresh(legacy_match)
                    return legacy_match
                self._session.add(account)
                await self._session.commit()
                await self._session.refresh(account)
                return account
            existing_by_email = await self._single_account_by_email(account.email)
            if existing_by_email and _can_merge_account_identity(existing_by_email, account):
                _apply_account_updates(existing_by_email, account)
                await self._session.commit()
                await self._session.refresh(existing_by_email)
                return existing_by_email

        self._session.add(account)
        await self._session.commit()
        await self._session.refresh(account)
        return account

    async def update_status(
        self,
        account_id: str,
        status: AccountStatus,
        deactivation_reason: str | None = None,
        reset_at: int | None = None,
    ) -> bool:
        result = await self._session.execute(
            update(Account)
            .where(Account.id == account_id)
            .values(status=status, deactivation_reason=deactivation_reason, reset_at=reset_at)
            .returning(Account.id)
        )
        await self._session.commit()
        return result.scalar_one_or_none() is not None

    async def update_status_if_current(
        self,
        account_id: str,
        status: AccountStatus,
        deactivation_reason: str | None = None,
        reset_at: int | None = None,
        *,
        expected_status: AccountStatus,
        expected_deactivation_reason: str | None = None,
        expected_reset_at: int | None = None,
    ) -> bool:
        stmt = (
            update(Account)
            .where(Account.id == account_id)
            .where(Account.status == expected_status)
            .values(status=status, deactivation_reason=deactivation_reason, reset_at=reset_at)
            .returning(Account.id)
        )
        if expected_deactivation_reason is None:
            stmt = stmt.where(Account.deactivation_reason.is_(None))
        else:
            stmt = stmt.where(Account.deactivation_reason == expected_deactivation_reason)
        if expected_reset_at is None:
            stmt = stmt.where(Account.reset_at.is_(None))
        else:
            stmt = stmt.where(Account.reset_at == expected_reset_at)
        result = await self._session.execute(stmt)
        await self._session.commit()
        return result.scalar_one_or_none() is not None

    async def delete(self, account_id: str) -> bool:
        await self._session.execute(delete(UsageHistory).where(UsageHistory.account_id == account_id))
        await self._session.execute(delete(RequestLog).where(RequestLog.account_id == account_id))
        await self._session.execute(delete(StickySession).where(StickySession.account_id == account_id))
        result = await self._session.execute(delete(Account).where(Account.id == account_id).returning(Account.id))
        await self._session.commit()
        return result.scalar_one_or_none() is not None

    async def update_tokens(
        self,
        account_id: str,
        access_token_encrypted: bytes,
        refresh_token_encrypted: bytes,
        id_token_encrypted: bytes,
        last_refresh: datetime,
        plan_type: str | None = None,
        email: str | None = None,
        chatgpt_account_id: str | None = None,
        workspace_id: str | None = None,
        workspace_name: str | None = None,
    ) -> bool:
        values: dict[str, object] = {
            "access_token_encrypted": access_token_encrypted,
            "refresh_token_encrypted": refresh_token_encrypted,
            "id_token_encrypted": id_token_encrypted,
            "last_refresh": last_refresh,
        }
        if plan_type is not None:
            values["plan_type"] = plan_type
        if email is not None:
            values["email"] = email
        if chatgpt_account_id is not None:
            values["chatgpt_account_id"] = chatgpt_account_id
        if workspace_id is not None or workspace_name is not None:
            values["workspace_id"] = workspace_id
            values["workspace_name"] = workspace_name
        result = await self._session.execute(
            update(Account).where(Account.id == account_id).values(**values).returning(Account.id)
        )
        await self._session.commit()
        return result.scalar_one_or_none() is not None

    async def update_identity_metadata(
        self,
        account_id: str,
        *,
        chatgpt_account_id: str | None = None,
        workspace_id: str | None = None,
        workspace_name: str | None = None,
    ) -> bool:
        values: dict[str, str | None] = {}
        if chatgpt_account_id is not None:
            values["chatgpt_account_id"] = chatgpt_account_id
        if workspace_id is not None or workspace_name is not None:
            values["workspace_id"] = workspace_id
            values["workspace_name"] = workspace_name
        if not values:
            return False
        result = await self._session.execute(
            update(Account).where(Account.id == account_id).values(**values).returning(Account.id)
        )
        await self._session.commit()
        return result.scalar_one_or_none() is not None

    async def _merge_by_email_enabled(self) -> bool:
        settings = await self._session.get(DashboardSettings, _SETTINGS_ROW_ID)
        if settings is None:
            return True
        return not settings.import_without_overwrite

    async def _next_available_account_id(self, base_id: str) -> str:
        candidate = base_id
        sequence = 2
        while await self._session.get(Account, candidate) is not None:
            candidate = f"{base_id}{_DUPLICATE_ACCOUNT_SUFFIX}{sequence}"
            sequence += 1
        return candidate

    async def _single_account_by_email(self, email: str) -> Account | None:
        result = await self._session.execute(
            select(Account).where(Account.email == email).order_by(Account.created_at.asc(), Account.id.asc()).limit(2)
        )
        matches = list(result.scalars().all())
        if not matches:
            return None
        if len(matches) > 1:
            raise AccountIdentityConflictError(email)
        return matches[0]

    async def _single_account_by_email_and_workspace(
        self,
        email: str,
        workspace_id: str | None,
        *,
        chatgpt_account_id: str | None = None,
        account_id: str | None = None,
    ) -> Account | None:
        if not workspace_id:
            return None
        base_stmt = (
            select(Account)
            .where(Account.email == email)
            .where(Account.workspace_id == workspace_id)
            .order_by(Account.created_at.asc(), Account.id.asc())
        )

        if account_id:
            result = await self._session.execute(base_stmt.where(Account.id == account_id).limit(2))
            exact_id_matches = list(result.scalars().all())
            if len(exact_id_matches) == 1:
                return exact_id_matches[0]
            if len(exact_id_matches) > 1:
                raise AccountIdentityConflictError(email)

        normalized_chatgpt_account_id = (chatgpt_account_id or "").strip()
        if normalized_chatgpt_account_id:
            result = await self._session.execute(
                base_stmt.where(Account.chatgpt_account_id == normalized_chatgpt_account_id).limit(2)
            )
            raw_account_matches = list(result.scalars().all())
            if len(raw_account_matches) == 1:
                return raw_account_matches[0]
            if len(raw_account_matches) > 1:
                raise AccountIdentityConflictError(email)

        result = await self._session.execute(base_stmt.limit(2))
        matches = list(result.scalars().all())
        if not matches:
            return None
        if len(matches) > 1:
            return None
        return matches[0]

    async def _single_account_by_email_without_workspace(self, email: str) -> Account | None:
        result = await self._session.execute(
            select(Account)
            .where(Account.email == email)
            .where(Account.workspace_id.is_(None))
            .order_by(Account.created_at.asc(), Account.id.asc())
            .limit(2)
        )
        matches = list(result.scalars().all())
        if not matches:
            return None
        if len(matches) > 1:
            raise AccountIdentityConflictError(email)
        return matches[0]

    def _dialect_name(self) -> str:
        return self._session.get_bind().dialect.name

    async def _acquire_sqlite_merge_lock(self) -> None:
        try:
            await self._session.execute(text("BEGIN IMMEDIATE"))
        except OperationalError as exc:
            message = str(exc).lower()
            if "within a transaction" not in message:
                raise
            # A no-op write escalates the current deferred transaction to a write
            # transaction, serializing concurrent writers.
            await self._session.execute(text("UPDATE accounts SET id = id WHERE 1 = 0"))

    async def _acquire_postgresql_merge_lock(self, email: str) -> None:
        lock_key = _advisory_lock_key("merge-email", email)
        await self._session.execute(
            text("SELECT pg_advisory_xact_lock(:lock_key)"),
            {"lock_key": lock_key},
        )

    async def _acquire_postgresql_identity_lock(self, account_id: str) -> None:
        lock_key = _advisory_lock_key("account-id", account_id)
        await self._session.execute(
            text("SELECT pg_advisory_xact_lock(:lock_key)"),
            {"lock_key": lock_key},
        )


def _apply_account_updates(target: Account, source: Account) -> None:
    target.chatgpt_account_id = source.chatgpt_account_id
    target.workspace_id = source.workspace_id
    target.workspace_name = source.workspace_name
    target.email = source.email
    target.plan_type = source.plan_type
    target.access_token_encrypted = source.access_token_encrypted
    target.refresh_token_encrypted = source.refresh_token_encrypted
    target.id_token_encrypted = source.id_token_encrypted
    target.last_refresh = source.last_refresh
    target.status = source.status
    target.deactivation_reason = source.deactivation_reason


def _can_merge_account_identity(target: Account, source: Account) -> bool:
    target_workspace_id = (target.workspace_id or "").strip() or None
    source_workspace_id = (source.workspace_id or "").strip() or None
    if target_workspace_id and source_workspace_id and target_workspace_id != source_workspace_id:
        return False

    target_chatgpt_account_id = (target.chatgpt_account_id or "").strip() or None
    source_chatgpt_account_id = (source.chatgpt_account_id or "").strip() or None
    if (
        target_chatgpt_account_id
        and source_chatgpt_account_id
        and target_chatgpt_account_id != source_chatgpt_account_id
    ):
        return False

    return True


def _advisory_lock_key(scope: str, value: str) -> int:
    digest = hashlib.sha256(f"{scope}:{value}".encode("utf-8")).digest()
    return int.from_bytes(digest[:8], byteorder="big", signed=True)

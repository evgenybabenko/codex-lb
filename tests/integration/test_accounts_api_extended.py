from __future__ import annotations

import base64
import json
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import update

from app.core.auth import fallback_account_id, generate_unique_account_id
from app.core.crypto import TokenEncryptor
from app.core.utils.time import utcnow
from app.db.models import Account, AccountStatus
from app.db.session import SessionLocal
from app.modules.accounts.repository import AccountsRepository
from app.modules.request_logs.repository import RequestLogsRepository
from app.modules.usage.repository import UsageRepository

pytestmark = pytest.mark.integration


def _encode_jwt(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    body = base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")
    return f"header.{body}.sig"


def _make_auth_json(
    account_id: str | None,
    email: str,
    plan_type: str = "plus",
    workspace_id: str | None = None,
    workspace_name: str | None = None,
    subscription_active_start: str | None = None,
    subscription_active_until: str | None = None,
    subscription_last_checked: str | None = None,
) -> dict:
    auth_payload: dict[str, object] = {"chatgpt_plan_type": plan_type}
    if workspace_id:
        workspace_entry: dict[str, object] = {"id": workspace_id, "default": True}
        if workspace_name:
            workspace_entry["name"] = workspace_name
        auth_payload["organizations"] = [workspace_entry]

    payload = {
        "email": email,
        "https://api.openai.com/auth": auth_payload,
    }
    if subscription_active_start:
        payload["https://api.openai.com/auth.chatgpt_subscription_active_start"] = subscription_active_start
    if subscription_active_until:
        payload["https://api.openai.com/auth.chatgpt_subscription_active_until"] = subscription_active_until
    if subscription_last_checked:
        payload["https://api.openai.com/auth.chatgpt_subscription_last_checked"] = subscription_last_checked
    if account_id:
        payload["chatgpt_account_id"] = account_id
    tokens: dict[str, object] = {
        "idToken": _encode_jwt(payload),
        "accessToken": "access",
        "refreshToken": "refresh",
    }
    if account_id:
        tokens["accountId"] = account_id
    return {"tokens": tokens}


def _make_account(account_id: str, email: str, plan_type: str = "plus") -> Account:
    encryptor = TokenEncryptor()
    return Account(
        id=account_id,
        email=email,
        plan_type=plan_type,
        access_token_encrypted=encryptor.encrypt("access"),
        refresh_token_encrypted=encryptor.encrypt("refresh"),
        id_token_encrypted=encryptor.encrypt("id"),
        last_refresh=utcnow(),
        status=AccountStatus.ACTIVE,
        deactivation_reason=None,
    )


def _iso_utc(epoch_seconds: int) -> str:
    return (
        datetime.fromtimestamp(epoch_seconds, tz=timezone.utc)
        .isoformat()
        .replace(
            "+00:00",
            "Z",
        )
    )


@pytest.mark.asyncio
async def test_import_invalid_json_returns_400(async_client):
    files = {"auth_json": ("auth.json", "not-json", "application/json")}
    response = await async_client.post("/api/accounts/import", files=files)
    assert response.status_code == 400
    payload = response.json()
    assert payload["error"]["code"] == "invalid_auth_json"


@pytest.mark.asyncio
async def test_import_missing_tokens_returns_400(async_client):
    files = {"auth_json": ("auth.json", json.dumps({"foo": "bar"}), "application/json")}
    response = await async_client.post("/api/accounts/import", files=files)
    assert response.status_code == 400
    payload = response.json()
    assert payload["error"]["code"] == "invalid_auth_json"


@pytest.mark.asyncio
async def test_import_falls_back_to_email_based_account_id(async_client):
    email = "fallback@example.com"
    auth_json = _make_auth_json(None, email)
    files = {"auth_json": ("auth.json", json.dumps(auth_json), "application/json")}
    response = await async_client.post("/api/accounts/import", files=files)
    assert response.status_code == 200
    payload = response.json()
    assert payload["accountId"] == fallback_account_id(email)
    assert payload["email"] == email


@pytest.mark.asyncio
async def test_import_overwrites_by_default_for_same_account_identity(async_client):
    email = "same-default@example.com"
    raw_account_id = "acc_same_default"

    files_one = {
        "auth_json": (
            "auth.json",
            json.dumps(_make_auth_json(raw_account_id, email, "plus")),
            "application/json",
        )
    }
    first = await async_client.post("/api/accounts/import", files=files_one)
    assert first.status_code == 200

    files_two = {
        "auth_json": (
            "auth.json",
            json.dumps(_make_auth_json(raw_account_id, email, "team")),
            "application/json",
        )
    }
    second = await async_client.post("/api/accounts/import", files=files_two)
    assert second.status_code == 200

    expected_account_id = generate_unique_account_id(raw_account_id, email)
    assert first.json()["accountId"] == expected_account_id
    assert second.json()["accountId"] == expected_account_id
    assert second.json()["planType"] == "team"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 1
    assert accounts[0]["accountId"] == expected_account_id
    assert accounts[0]["planType"] == "team"


@pytest.mark.asyncio
async def test_accounts_list_exposes_subscription_dates_from_id_token(async_client):
    email = "subscription@example.com"
    raw_account_id = "acc_subscription"

    response = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "team",
                        subscription_active_start="2026-03-17T10:48:54+00:00",
                        subscription_active_until="2026-04-17T10:48:54+00:00",
                        subscription_last_checked="2026-04-03T19:13:16.315675+00:00",
                    )
                ),
                "application/json",
            )
        },
    )
    assert response.status_code == 200

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    account = next(entry for entry in accounts_response.json()["accounts"] if entry["email"] == email)
    assert account["auth"]["subscriptionActiveStart"] == "2026-03-17T10:48:54Z"
    assert account["auth"]["subscriptionActiveUntil"] == "2026-04-17T10:48:54Z"
    assert account["auth"]["subscriptionLastChecked"] == "2026-04-03T19:13:16.315675Z"


@pytest.mark.asyncio
async def test_import_keeps_same_login_separate_when_workspace_differs(async_client):
    email = "same-workspace@example.com"
    raw_account_id = "acc_same_workspace"

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "plus",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert first.status_code == 200

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "team",
                        workspace_id="org_beta",
                        workspace_name="Beta",
                    )
                ),
                "application/json",
            )
        },
    )
    assert second.status_code == 200

    first_id = generate_unique_account_id(raw_account_id, email, "org_alpha")
    second_id = generate_unique_account_id(raw_account_id, email, "org_beta")
    assert first.json()["accountId"] == first_id
    assert second.json()["accountId"] == second_id
    assert first.json()["workspaceId"] == "org_alpha"
    assert second.json()["workspaceId"] == "org_beta"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    by_id = {entry["accountId"]: entry for entry in accounts}
    assert by_id[first_id]["workspaceName"] == "Alpha"
    assert by_id[second_id]["workspaceName"] == "Beta"


@pytest.mark.asyncio
async def test_import_overwrites_same_email_and_workspace_when_chatgpt_account_matches(async_client):
    email = "same-email-workspace@example.com"
    raw_account_id = "acc_same_email_workspace"
    account_id = generate_unique_account_id(raw_account_id, email, "org_alpha")

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "plus",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert first.status_code == 200
    assert first.json()["accountId"] == account_id
    assert first.json()["planType"] == "plus"

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "team",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert second.status_code == 200
    assert second.json()["accountId"] == account_id
    assert second.json()["planType"] == "team"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 1
    assert accounts[0]["accountId"] == account_id
    assert accounts[0]["workspaceId"] == "org_alpha"
    assert accounts[0]["workspaceName"] == "Alpha"
    assert accounts[0]["planType"] == "team"


@pytest.mark.asyncio
async def test_import_updates_correct_row_when_same_email_and_workspace_have_multiple_raw_accounts(async_client):
    email = "same-email-shared-workspace@example.com"

    first_raw_account_id = "acc_workspace_first"
    second_raw_account_id = "acc_workspace_second"
    workspace_id = "org_shared"
    workspace_name = "Shared"

    first_id = generate_unique_account_id(first_raw_account_id, email, workspace_id)
    second_id = generate_unique_account_id(second_raw_account_id, email, workspace_id)

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        first_raw_account_id,
                        email,
                        "plus",
                        workspace_id=workspace_id,
                        workspace_name=workspace_name,
                    )
                ),
                "application/json",
            )
        },
    )
    assert first.status_code == 200
    assert first.json()["accountId"] == first_id

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        second_raw_account_id,
                        email,
                        "team",
                        workspace_id=workspace_id,
                        workspace_name=workspace_name,
                    )
                ),
                "application/json",
            )
        },
    )
    assert second.status_code == 200
    assert second.json()["accountId"] == second_id

    update_second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        second_raw_account_id,
                        email,
                        "pro",
                        workspace_id=workspace_id,
                        workspace_name=workspace_name,
                    )
                ),
                "application/json",
            )
        },
    )
    assert update_second.status_code == 200
    assert update_second.json()["accountId"] == second_id
    assert update_second.json()["planType"] == "pro"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    by_id = {entry["accountId"]: entry for entry in accounts}
    assert by_id[first_id]["planType"] == "plus"
    assert by_id[second_id]["planType"] == "pro"


@pytest.mark.asyncio
async def test_import_updates_correct_row_when_same_email_and_workspace_have_three_raw_accounts(async_client):
    email = "same-email-many-shared-workspace@example.com"
    workspace_id = "org_many_shared"
    workspace_name = "Many Shared"
    raw_account_ids = ["acc_workspace_first", "acc_workspace_second", "acc_workspace_third"]
    plan_types = ["plus", "team", "pro"]

    for raw_account_id, plan_type in zip(raw_account_ids, plan_types, strict=True):
        response = await async_client.post(
            "/api/accounts/import",
            files={
                "auth_json": (
                    "auth.json",
                    json.dumps(
                        _make_auth_json(
                            raw_account_id,
                            email,
                            plan_type,
                            workspace_id=workspace_id,
                            workspace_name=workspace_name,
                        )
                    ),
                    "application/json",
                )
            },
        )
        assert response.status_code == 200

    update_third = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_ids[2],
                        email,
                        "enterprise",
                        workspace_id=workspace_id,
                        workspace_name=workspace_name,
                    )
                ),
                "application/json",
            )
        },
    )
    assert update_third.status_code == 200
    third_id = generate_unique_account_id(raw_account_ids[2], email, workspace_id)
    assert update_third.json()["accountId"] == third_id
    assert update_third.json()["planType"] == "enterprise"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 3
    by_id = {entry["accountId"]: entry for entry in accounts}
    assert by_id[generate_unique_account_id(raw_account_ids[0], email, workspace_id)]["planType"] == "plus"
    assert by_id[generate_unique_account_id(raw_account_ids[1], email, workspace_id)]["planType"] == "team"
    assert by_id[third_id]["planType"] == "enterprise"


@pytest.mark.asyncio
async def test_import_backfills_legacy_workspace_identity_before_overwrite(async_client):
    email = "legacy-workspace@example.com"
    raw_account_id = "acc_legacy_workspace"
    alpha_id = generate_unique_account_id(raw_account_id, email, "org_alpha")
    beta_id = generate_unique_account_id(raw_account_id, email, "org_beta")

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "plus",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert first.status_code == 200
    assert first.json()["accountId"] == alpha_id

    async with SessionLocal() as session:
        await session.execute(
            update(Account).where(Account.id == alpha_id).values(workspace_id=None, workspace_name=None)
        )
        await session.commit()

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        raw_account_id,
                        email,
                        "team",
                        workspace_id="org_beta",
                        workspace_name="Beta",
                    )
                ),
                "application/json",
            )
        },
    )
    assert second.status_code == 200
    assert second.json()["accountId"] == beta_id

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    by_id = {entry["accountId"]: entry for entry in accounts}
    assert by_id[alpha_id]["workspaceId"] == "org_alpha"
    assert by_id[alpha_id]["workspaceName"] == "Alpha"
    assert by_id[beta_id]["workspaceId"] == "org_beta"
    assert by_id[beta_id]["workspaceName"] == "Beta"


@pytest.mark.asyncio
async def test_import_keeps_same_email_and_workspace_separate_when_chatgpt_account_changes(async_client):
    email = "same-email-same-workspace@example.com"

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        "acc_workspace_alpha",
                        email,
                        "plus",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert first.status_code == 200

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(
                    _make_auth_json(
                        "acc_workspace_beta",
                        email,
                        "team",
                        workspace_id="org_alpha",
                        workspace_name="Alpha",
                    )
                ),
                "application/json",
            )
        },
    )
    assert second.status_code == 200

    first_id = generate_unique_account_id("acc_workspace_alpha", email, "org_alpha")
    second_id = generate_unique_account_id("acc_workspace_beta", email, "org_alpha")
    assert first.json()["accountId"] == first_id
    assert second.json()["accountId"] == second_id

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    ids = {entry["accountId"] for entry in accounts}
    assert ids == {first_id, second_id}


@pytest.mark.asyncio
async def test_import_without_overwrite_keeps_same_account_identity_separate(async_client):
    settings = await async_client.put(
        "/api/settings",
        json={
            "stickyThreadsEnabled": False,
            "weeklyResetPreference": "disabled",
            "importWithoutOverwrite": True,
            "totpRequiredOnLogin": False,
        },
    )
    assert settings.status_code == 200
    assert settings.json()["importWithoutOverwrite"] is True

    email = "same-separate@example.com"
    raw_account_id = "acc_same_separate"

    files_one = {
        "auth_json": (
            "auth.json",
            json.dumps(_make_auth_json(raw_account_id, email, "plus")),
            "application/json",
        )
    }
    first = await async_client.post("/api/accounts/import", files=files_one)
    assert first.status_code == 200

    files_two = {
        "auth_json": (
            "auth.json",
            json.dumps(_make_auth_json(raw_account_id, email, "team")),
            "application/json",
        )
    }
    second = await async_client.post("/api/accounts/import", files=files_two)
    assert second.status_code == 200

    base_account_id = generate_unique_account_id(raw_account_id, email)
    first_id = first.json()["accountId"]
    second_id = second.json()["accountId"]
    assert first_id == base_account_id
    assert second_id != first_id
    assert second_id.startswith(f"{base_account_id}__copy")

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    ids = {entry["accountId"] for entry in accounts}
    assert ids == {first_id, second_id}


@pytest.mark.asyncio
async def test_import_returns_409_when_overwrite_mode_cannot_resolve_duplicate_email(async_client):
    enable_separate = await async_client.put(
        "/api/settings",
        json={
            "stickyThreadsEnabled": False,
            "weeklyResetPreference": "disabled",
            "importWithoutOverwrite": True,
            "totpRequiredOnLogin": False,
        },
    )
    assert enable_separate.status_code == 200
    assert enable_separate.json()["importWithoutOverwrite"] is True

    email = "conflict@example.com"
    raw_account_id = "acc_conflict_base"

    first = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(_make_auth_json(raw_account_id, email, "plus")),
                "application/json",
            )
        },
    )
    assert first.status_code == 200

    second = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(_make_auth_json(raw_account_id, email, "team")),
                "application/json",
            )
        },
    )
    assert second.status_code == 200
    assert second.json()["accountId"] != first.json()["accountId"]

    enable_overwrite = await async_client.put(
        "/api/settings",
        json={
            "stickyThreadsEnabled": False,
            "weeklyResetPreference": "disabled",
            "importWithoutOverwrite": False,
            "totpRequiredOnLogin": False,
        },
    )
    assert enable_overwrite.status_code == 200
    assert enable_overwrite.json()["importWithoutOverwrite"] is False

    conflict = await async_client.post(
        "/api/accounts/import",
        files={
            "auth_json": (
                "auth.json",
                json.dumps(_make_auth_json("acc_conflict_new", email, "pro")),
                "application/json",
            )
        },
    )
    assert conflict.status_code == 409
    payload = conflict.json()
    assert payload["error"]["code"] == "duplicate_identity_conflict"

    accounts_response = await async_client.get("/api/accounts")
    assert accounts_response.status_code == 200
    accounts = [entry for entry in accounts_response.json()["accounts"] if entry["email"] == email]
    assert len(accounts) == 2
    assert all(entry["planType"] != "pro" for entry in accounts)


@pytest.mark.asyncio
async def test_delete_account_removes_from_list(async_client):
    email = "delete@example.com"
    raw_account_id = "acc_delete"
    auth_json = _make_auth_json(raw_account_id, email)
    files = {"auth_json": ("auth.json", json.dumps(auth_json), "application/json")}
    response = await async_client.post("/api/accounts/import", files=files)
    assert response.status_code == 200

    actual_account_id = generate_unique_account_id(raw_account_id, email)
    delete = await async_client.delete(f"/api/accounts/{actual_account_id}")
    assert delete.status_code == 200
    assert delete.json()["status"] == "deleted"

    accounts = await async_client.get("/api/accounts")
    assert accounts.status_code == 200
    data = accounts.json()["accounts"]
    assert all(account["accountId"] != actual_account_id for account in data)


@pytest.mark.asyncio
async def test_accounts_list_includes_per_account_reset_times(async_client, db_setup):
    primary_a = 1735689600
    primary_b = 1735693200
    secondary_a = 1736294400
    secondary_b = 1736380800

    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        usage_repo = UsageRepository(session)

        await accounts_repo.upsert(_make_account("acc_reset_a", "a@example.com"))
        await accounts_repo.upsert(_make_account("acc_reset_b", "b@example.com"))

        await usage_repo.add_entry(
            "acc_reset_a",
            10.0,
            window="primary",
            reset_at=primary_a,
            window_minutes=300,
        )
        await usage_repo.add_entry(
            "acc_reset_b",
            20.0,
            window="primary",
            reset_at=primary_b,
            window_minutes=300,
        )
        await usage_repo.add_entry(
            "acc_reset_a",
            30.0,
            window="secondary",
            reset_at=secondary_a,
            window_minutes=10080,
        )
        await usage_repo.add_entry(
            "acc_reset_b",
            40.0,
            window="secondary",
            reset_at=secondary_b,
            window_minutes=10080,
        )

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    assert accounts["acc_reset_a"]["resetAtPrimary"] == _iso_utc(primary_a)
    assert accounts["acc_reset_b"]["resetAtPrimary"] == _iso_utc(primary_b)
    assert accounts["acc_reset_a"]["resetAtSecondary"] == _iso_utc(secondary_a)
    assert accounts["acc_reset_b"]["resetAtSecondary"] == _iso_utc(secondary_b)
    assert accounts["acc_reset_a"]["windowMinutesPrimary"] == 300
    assert accounts["acc_reset_b"]["windowMinutesPrimary"] == 300
    assert accounts["acc_reset_a"]["windowMinutesSecondary"] == 10080
    assert accounts["acc_reset_b"]["windowMinutesSecondary"] == 10080


@pytest.mark.asyncio
async def test_accounts_list_includes_request_usage_cost_rollup(async_client, db_setup):
    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        logs_repo = RequestLogsRepository(session)

        await accounts_repo.upsert(_make_account("acc_cost", "cost@example.com"))
        await accounts_repo.upsert(_make_account("acc_other", "other@example.com"))

        await logs_repo.add_log(
            account_id="acc_cost",
            request_id="req_cost_1",
            model="gpt-5.3-codex",
            input_tokens=100_000,
            output_tokens=20_000,
            cached_input_tokens=90_000,
            latency_ms=200,
            status="success",
            error_code=None,
        )
        await logs_repo.add_log(
            account_id="acc_cost",
            request_id="req_cost_2",
            model="gpt-5.1-codex",
            input_tokens=50_000,
            output_tokens=10_000,
            cached_input_tokens=0,
            latency_ms=180,
            status="success",
            error_code=None,
        )
        await logs_repo.add_log(
            account_id="acc_other",
            request_id="req_other_1",
            model="gpt-5.1-codex-mini",
            input_tokens=1_000,
            output_tokens=500,
            cached_input_tokens=0,
            latency_ms=150,
            status="success",
            error_code=None,
        )

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    request_usage = accounts["acc_cost"]["requestUsage"]
    assert request_usage is not None
    assert request_usage["requestCount"] == 2
    assert request_usage["totalTokens"] == 180_000
    assert request_usage["cachedInputTokens"] == 90_000
    assert request_usage["totalCostUsd"] == pytest.approx(0.47575, abs=1e-6)

    other_usage = accounts["acc_other"]["requestUsage"]
    assert other_usage is not None
    assert other_usage["requestCount"] == 1
    assert other_usage["totalTokens"] == 1_500


@pytest.mark.asyncio
async def test_accounts_list_request_usage_cost_rollup_respects_service_tier(async_client, db_setup):
    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        logs_repo = RequestLogsRepository(session)

        await accounts_repo.upsert(_make_account("acc_priority_cost", "priority-cost@example.com"))

        await logs_repo.add_log(
            account_id="acc_priority_cost",
            request_id="req_priority_cost_1",
            model="gpt-5.4",
            service_tier="priority",
            input_tokens=1_000_000,
            output_tokens=1_000_000,
            latency_ms=200,
            status="success",
            error_code=None,
        )

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    request_usage = accounts["acc_priority_cost"]["requestUsage"]
    assert request_usage is not None
    assert request_usage["requestCount"] == 1
    assert request_usage["totalTokens"] == 2_000_000
    assert request_usage["cachedInputTokens"] == 0
    assert request_usage["totalCostUsd"] == pytest.approx(35.0, abs=1e-6)


@pytest.mark.asyncio
async def test_accounts_list_request_usage_uses_persisted_cost(async_client, db_setup):
    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        logs_repo = RequestLogsRepository(session)

        await accounts_repo.upsert(_make_account("acc_persisted_cost", "persisted-cost@example.com"))

        log = await logs_repo.add_log(
            account_id="acc_persisted_cost",
            request_id="req_persisted_cost_1",
            model="gpt-5.1",
            input_tokens=10,
            output_tokens=5,
            latency_ms=50,
            status="success",
            error_code=None,
        )
        await session.execute(update(log.__class__).where(log.__class__.id == log.id).values(cost_usd=12.345678))
        await session.commit()

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    request_usage = accounts["acc_persisted_cost"]["requestUsage"]
    assert request_usage is not None
    assert request_usage["totalCostUsd"] == pytest.approx(12.345678, abs=1e-6)


@pytest.mark.asyncio
async def test_accounts_list_maps_weekly_only_primary_to_secondary(async_client, db_setup):
    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        usage_repo = UsageRepository(session)

        await accounts_repo.upsert(_make_account("acc_free_like", "free@example.com", plan_type="free"))
        await usage_repo.add_entry(
            "acc_free_like",
            24.0,
            window="primary",
            window_minutes=10080,
        )

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    account = accounts["acc_free_like"]
    assert account["usage"]["primaryRemainingPercent"] is None
    assert account["usage"]["secondaryRemainingPercent"] == pytest.approx(76.0)
    assert account["windowMinutesPrimary"] is None
    assert account["windowMinutesSecondary"] == 10080


@pytest.mark.asyncio
async def test_accounts_list_prefers_newer_weekly_primary_over_stale_secondary(async_client, db_setup):
    now = utcnow()
    stale_reset = 1735689600
    weekly_reset = 1735862400

    async with SessionLocal() as session:
        accounts_repo = AccountsRepository(session)
        usage_repo = UsageRepository(session)

        await accounts_repo.upsert(_make_account("acc_weekly_stale", "weekly-stale@example.com", plan_type="free"))
        await usage_repo.add_entry(
            "acc_weekly_stale",
            15.0,
            window="secondary",
            reset_at=stale_reset,
            window_minutes=10080,
            recorded_at=now - timedelta(days=2),
        )
        await usage_repo.add_entry(
            "acc_weekly_stale",
            80.0,
            window="primary",
            reset_at=weekly_reset,
            window_minutes=10080,
            recorded_at=now,
        )

    response = await async_client.get("/api/accounts")
    assert response.status_code == 200
    payload = response.json()
    accounts = {item["accountId"]: item for item in payload["accounts"]}

    account = accounts["acc_weekly_stale"]
    assert account["usage"]["primaryRemainingPercent"] is None
    assert account["usage"]["secondaryRemainingPercent"] == pytest.approx(20.0)
    assert account["windowMinutesPrimary"] is None
    assert account["windowMinutesSecondary"] == 10080
    assert account["resetAtSecondary"] == _iso_utc(weekly_reset)

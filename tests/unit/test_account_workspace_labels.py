from __future__ import annotations

from types import SimpleNamespace

import pytest

import app.modules.accounts.service as accounts_service_module
import app.modules.dashboard.service as dashboard_service_module
from app.core.crypto import TokenEncryptor
from app.core.utils.time import utcnow
from app.db.models import Account, AccountStatus
from app.modules.accounts.mappers import build_account_summaries
from app.modules.accounts.service import AccountsService
from app.modules.dashboard.service import DashboardService


def _make_account() -> Account:
    encryptor = TokenEncryptor()
    return Account(
        id="acc_1",
        chatgpt_account_id="org_account_1",
        workspace_id=None,
        workspace_name=None,
        email="user@example.com",
        plan_type="team",
        access_token_encrypted=encryptor.encrypt("access"),
        refresh_token_encrypted=encryptor.encrypt("refresh"),
        id_token_encrypted=encryptor.encrypt("header.e30.sig"),
        last_refresh=utcnow(),
        status=AccountStatus.ACTIVE,
        deactivation_reason=None,
    )


def test_build_account_summaries_prefers_upstream_workspace_label() -> None:
    account = _make_account()
    encryptor = TokenEncryptor()

    summaries = build_account_summaries(
        accounts=[account],
        primary_usage={},
        secondary_usage={},
        workspace_labels_by_account_id={"acc_1": "Ve3ultra"},
        encryptor=encryptor,
    )

    assert len(summaries) == 1
    assert summaries[0].workspace_id is None
    assert summaries[0].workspace_name == "Ve3ultra"


@pytest.mark.asyncio
async def test_fetch_workspace_labels_aggregates_multiple_access_tokens(monkeypatch: pytest.MonkeyPatch) -> None:
    encryptor = TokenEncryptor()
    first = _make_account()
    second = _make_account()
    first.chatgpt_account_id = "acc_first"
    first.access_token_encrypted = encryptor.encrypt("access-one")
    second.id = "acc_2"
    second.email = "other@example.com"
    second.chatgpt_account_id = "acc_second"
    second.access_token_encrypted = encryptor.encrypt("access-two")

    calls: list[str] = []

    async def fake_fetch_account_labels(access_token: str, chatgpt_account_id: str | None = None) -> dict[str, str]:
        calls.append(access_token)
        if access_token == "access-one":
            return {"acc_first": "First"}
        if access_token == "access-two":
            return {"acc_second": "Second"}
        return {}

    monkeypatch.setattr(accounts_service_module, "fetch_account_labels", fake_fetch_account_labels)

    async def fake_update_identity_metadata(*args, **kwargs) -> bool:
        return True

    repo = SimpleNamespace(update_identity_metadata=fake_update_identity_metadata)
    service = AccountsService(repo=repo)
    labels = await service._fetch_workspace_labels([first, second])

    assert labels == {"acc_1": "First", "acc_2": "Second"}
    assert calls == ["access-one", "access-two"]


@pytest.mark.asyncio
async def test_dashboard_fetch_workspace_labels_groups_by_email_and_uses_internal_ids(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    encryptor = TokenEncryptor()
    first = _make_account()
    second = _make_account()
    third = _make_account()

    first.id = "acc_1"
    first.email = "one@example.com"
    first.chatgpt_account_id = "shared"
    first.access_token_encrypted = encryptor.encrypt("access-one")

    second.id = "acc_2"
    second.email = "two@example.com"
    second.chatgpt_account_id = "shared"
    second.access_token_encrypted = encryptor.encrypt("access-two")

    third.id = "acc_3"
    third.email = "two@example.com"
    third.chatgpt_account_id = "unique-two"
    third.access_token_encrypted = encryptor.encrypt("access-two")

    calls: list[str] = []
    updates: list[tuple[str, str | None, str]] = []

    async def fake_fetch_account_labels(access_token: str, chatgpt_account_id: str | None = None) -> dict[str, str]:
        calls.append(access_token)
        if access_token == "access-one":
            return {"shared": "Shared One"}
        if access_token == "access-two":
            return {"shared": "Shared Two", "unique-two": "2"}
        return {}

    async def fake_update_account_workspace_name(
        account_id: str,
        *,
        workspace_id: str | None,
        workspace_name: str,
    ) -> bool:
        updates.append((account_id, workspace_id, workspace_name))
        return True

    monkeypatch.setattr(dashboard_service_module, "fetch_account_labels", fake_fetch_account_labels)

    repo = SimpleNamespace(update_account_workspace_name=fake_update_account_workspace_name)
    service = DashboardService(repo=repo)
    labels = await service._fetch_workspace_labels([first, second, third])

    assert labels == {"acc_1": "Shared One", "acc_2": "Shared Two", "acc_3": "2"}
    assert calls == ["access-one", "access-two"]
    assert updates == [
        ("acc_1", None, "Shared One"),
        ("acc_2", None, "Shared Two"),
        ("acc_3", None, "2"),
    ]

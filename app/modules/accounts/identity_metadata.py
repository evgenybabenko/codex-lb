from __future__ import annotations

import logging
from collections.abc import Sequence

from app.core.auth import OpenAIAuthClaims, extract_id_token_claims, workspace_identity_from_claims
from app.core.crypto import TokenEncryptor
from app.db.models import Account
from app.modules.accounts.repository import AccountsRepository

logger = logging.getLogger(__name__)


async def backfill_account_identity_metadata_for_email(
    repo: AccountsRepository,
    encryptor: TokenEncryptor,
    email: str,
) -> None:
    accounts = await repo.list_accounts_by_email(email)
    await backfill_account_identity_metadata(repo, encryptor, accounts)


async def backfill_account_identity_metadata(
    repo: AccountsRepository,
    encryptor: TokenEncryptor,
    accounts: Sequence[Account],
) -> None:
    for account in accounts:
        try:
            id_token = encryptor.decrypt(account.id_token_encrypted)
        except Exception:
            logger.warning("Failed to decrypt id_token for account_id=%s during identity backfill", account.id)
            continue

        claims = extract_id_token_claims(id_token)
        auth_claims = claims.auth or OpenAIAuthClaims()
        raw_account_id = auth_claims.chatgpt_account_id or claims.chatgpt_account_id
        workspace_id, workspace_name = workspace_identity_from_claims(claims)

        if not _identity_metadata_changed(account, raw_account_id, workspace_id, workspace_name):
            continue

        updated = await repo.update_identity_metadata(
            account.id,
            chatgpt_account_id=raw_account_id,
            workspace_id=workspace_id,
            workspace_name=workspace_name,
        )
        if not updated:
            continue

        if raw_account_id is not None:
            account.chatgpt_account_id = raw_account_id
        if workspace_id is not None or workspace_name is not None:
            account.workspace_id = workspace_id
            account.workspace_name = workspace_name


def _identity_metadata_changed(
    account: Account,
    raw_account_id: str | None,
    workspace_id: str | None,
    workspace_name: str | None,
) -> bool:
    if raw_account_id and raw_account_id != account.chatgpt_account_id:
        return True
    if workspace_id != account.workspace_id:
        return True
    if workspace_name != account.workspace_name and (workspace_id is not None or account.workspace_id is not None):
        return True
    return False

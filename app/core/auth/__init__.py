from __future__ import annotations

import base64
import hashlib
import json
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

DEFAULT_EMAIL = "unknown@example.com"
DEFAULT_PLAN = "unknown"


class AuthTokens(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id_token: str = Field(alias="idToken")
    access_token: str = Field(alias="accessToken")
    refresh_token: str = Field(alias="refreshToken")
    account_id: str | None = Field(default=None, alias="accountId")


class AuthFile(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    tokens: AuthTokens
    last_refresh_at: datetime | None = Field(default=None, alias="lastRefreshAt")


class WorkspaceClaim(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("id", "organization_id", "org_id", "workspace_id"),
    )
    name: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "name",
            "display_name",
            "organization_name",
            "workspace_name",
            "title",
        ),
    )
    is_default: bool | None = Field(
        default=None,
        validation_alias=AliasChoices("default", "is_default", "isDefault", "active", "selected", "current"),
    )


class OpenAIAuthClaims(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    chatgpt_account_id: str | None = None
    chatgpt_plan_type: str | None = None
    workspace_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace_id",
            "organization_id",
            "org_id",
            "active_workspace_id",
            "active_organization_id",
            "default_workspace_id",
            "default_organization_id",
        ),
    )
    workspace_name: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace_name",
            "organization_name",
            "active_workspace_name",
            "active_organization_name",
            "default_workspace_name",
            "default_organization_name",
        ),
    )
    workspace: WorkspaceClaim | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace",
            "organization",
            "active_workspace",
            "active_organization",
            "default_workspace",
            "default_organization",
        ),
    )
    organizations: list[WorkspaceClaim] = Field(
        default_factory=list,
        validation_alias=AliasChoices("organizations", "workspaces"),
    )


class IdTokenClaims(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    email: str | None = None
    chatgpt_account_id: str | None = None
    chatgpt_plan_type: str | None = None
    workspace_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace_id",
            "organization_id",
            "org_id",
            "active_workspace_id",
            "active_organization_id",
            "default_workspace_id",
            "default_organization_id",
        ),
    )
    workspace_name: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace_name",
            "organization_name",
            "active_workspace_name",
            "active_organization_name",
            "default_workspace_name",
            "default_organization_name",
        ),
    )
    workspace: WorkspaceClaim | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "workspace",
            "organization",
            "active_workspace",
            "active_organization",
            "default_workspace",
            "default_organization",
        ),
    )
    organizations: list[WorkspaceClaim] = Field(
        default_factory=list,
        validation_alias=AliasChoices("organizations", "workspaces"),
    )
    chatgpt_subscription_active_start: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "chatgpt_subscription_active_start",
            "https://api.openai.com/auth.chatgpt_subscription_active_start",
        ),
    )
    chatgpt_subscription_active_until: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "chatgpt_subscription_active_until",
            "https://api.openai.com/auth.chatgpt_subscription_active_until",
        ),
    )
    chatgpt_subscription_last_checked: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "chatgpt_subscription_last_checked",
            "https://api.openai.com/auth.chatgpt_subscription_last_checked",
        ),
    )
    exp: int | float | str | None = None
    auth: OpenAIAuthClaims | None = Field(
        default=None,
        alias="https://api.openai.com/auth",
    )


@dataclass
class AccountClaims:
    account_id: str | None
    email: str | None
    plan_type: str | None
    workspace_id: str | None
    workspace_name: str | None


def parse_auth_json(raw: bytes) -> AuthFile:
    data = json.loads(raw)
    model = AuthFile.model_validate(data)
    return model


def extract_id_token_claims(id_token: str) -> IdTokenClaims:
    try:
        parts = id_token.split(".")
        if len(parts) < 2:
            return IdTokenClaims()
        payload = parts[1]
        padding = "=" * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding)
        data = json.loads(decoded)
        if not isinstance(data, dict):
            return IdTokenClaims()
        return IdTokenClaims.model_validate(data)
    except Exception:
        return IdTokenClaims()


def claims_from_auth(auth: AuthFile) -> AccountClaims:
    claims = extract_id_token_claims(auth.tokens.id_token)
    auth_claims = claims.auth or OpenAIAuthClaims()
    plan_type = auth_claims.chatgpt_plan_type or claims.chatgpt_plan_type
    workspace_id, workspace_name = workspace_identity_from_claims(claims)
    return AccountClaims(
        account_id=auth.tokens.account_id or auth_claims.chatgpt_account_id or claims.chatgpt_account_id,
        email=claims.email,
        plan_type=plan_type,
        workspace_id=workspace_id,
        workspace_name=workspace_name,
    )


def generate_unique_account_id(account_id: str | None, email: str | None, workspace_id: str | None = None) -> str:
    if account_id and email and email != DEFAULT_EMAIL:
        email_hash = hashlib.sha256(email.encode()).hexdigest()[:8]
        base_id = f"{account_id}_{email_hash}"
    elif account_id:
        base_id = account_id
    else:
        base_id = fallback_account_id(email)
    if workspace_id and workspace_id != account_id:
        return f"{base_id}_{_identity_suffix(workspace_id)}"
    return base_id


def fallback_account_id(email: str | None) -> str:
    """Generate a fallback account ID when no OpenAI account ID is available."""
    if email and email != DEFAULT_EMAIL:
        digest = hashlib.sha256(email.encode()).hexdigest()[:12]
        return f"email_{digest}"
    return f"local_{uuid4().hex[:12]}"


def workspace_identity_from_claims(claims: IdTokenClaims) -> tuple[str | None, str | None]:
    workspace_id, workspace_name = _resolve_workspace_identity(
        claims.auth or OpenAIAuthClaims(),
        claims,
    )
    return normalize_workspace_identity(workspace_id, workspace_name)


def normalize_workspace_identity(
    workspace_id: str | None,
    workspace_name: str | None,
) -> tuple[str | None, str | None]:
    normalized_id = _normalize_workspace_value(workspace_id)
    normalized_name = _normalize_workspace_value(workspace_name)
    if normalized_name and normalized_name.lower() == "personal":
        normalized_name = None
    return normalized_id, normalized_name


def _resolve_workspace_identity(
    auth_claims: OpenAIAuthClaims,
    claims: IdTokenClaims,
) -> tuple[str | None, str | None]:
    for source in (auth_claims, claims):
        workspace_id, workspace_name = _workspace_from_source(source)
        if workspace_id or workspace_name:
            return workspace_id, workspace_name
    return None, None


def _workspace_from_source(source: OpenAIAuthClaims | IdTokenClaims) -> tuple[str | None, str | None]:
    if source.workspace_id or source.workspace_name:
        return source.workspace_id, source.workspace_name
    if source.workspace and (source.workspace.id or source.workspace.name):
        return source.workspace.id, source.workspace.name
    selected = _select_workspace(source.organizations)
    if selected is None:
        return None, None
    return selected.id, selected.name


def _select_workspace(workspaces: list[WorkspaceClaim]) -> WorkspaceClaim | None:
    if not workspaces:
        return None
    for workspace in workspaces:
        if workspace.is_default is True:
            return workspace
    if len(workspaces) == 1:
        return workspaces[0]
    return None


def _identity_suffix(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:8]


def _normalize_workspace_value(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None

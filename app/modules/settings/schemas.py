from __future__ import annotations

from pydantic import Field

from app.modules.shared.schemas import DashboardModel


class DashboardSettingsResponse(DashboardModel):
    sticky_threads_enabled: bool
    upstream_stream_transport: str = Field(pattern=r"^(default|auto|http|websocket)$")
    weekly_reset_preference: str = Field(pattern=r"^(disabled|earlier_reset|expiring_quota_priority)$")
    prioritize_full_weekly_capacity: bool
    routing_strategy: str = Field(pattern=r"^(usage_weighted|round_robin|capacity_weighted)$")
    openai_cache_affinity_max_age_seconds: int = Field(gt=0)
    http_responses_session_bridge_prompt_cache_idle_ttl_seconds: int = Field(gt=0)
    sticky_reallocation_budget_threshold_pct: float = Field(ge=0.0, le=100.0)
    spread_new_codex_sessions: bool
    spread_new_codex_sessions_window_seconds: int = Field(gt=0)
    spread_new_codex_sessions_top_pool_size: int = Field(gt=0)
    import_without_overwrite: bool
    totp_required_on_login: bool
    totp_configured: bool
    api_key_auth_enabled: bool


class DashboardSettingsUpdateRequest(DashboardModel):
    sticky_threads_enabled: bool
    upstream_stream_transport: str | None = Field(
        default=None,
        pattern=r"^(default|auto|http|websocket)$",
    )
    weekly_reset_preference: str | None = Field(
        default=None,
        pattern=r"^(disabled|earlier_reset|expiring_quota_priority)$",
    )
    prioritize_full_weekly_capacity: bool | None = None
    routing_strategy: str | None = Field(default=None, pattern=r"^(usage_weighted|round_robin|capacity_weighted)$")
    openai_cache_affinity_max_age_seconds: int | None = Field(default=None, gt=0)
    http_responses_session_bridge_prompt_cache_idle_ttl_seconds: int | None = Field(default=None, gt=0)
    sticky_reallocation_budget_threshold_pct: float | None = Field(default=None, ge=0.0, le=100.0)
    spread_new_codex_sessions: bool | None = None
    spread_new_codex_sessions_window_seconds: int | None = Field(default=None, gt=0)
    spread_new_codex_sessions_top_pool_size: int | None = Field(default=None, gt=0)
    import_without_overwrite: bool | None = None
    totp_required_on_login: bool | None = None
    api_key_auth_enabled: bool | None = None


class RuntimeConnectAddressResponse(DashboardModel):
    connect_address: str

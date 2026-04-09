from __future__ import annotations

from dataclasses import dataclass

from app.modules.settings.repository import SettingsRepository


@dataclass(frozen=True, slots=True)
class DashboardSettingsData:
    sticky_threads_enabled: bool
    upstream_stream_transport: str
    weekly_reset_preference: str
    prioritize_full_weekly_capacity: bool
    routing_strategy: str
    openai_cache_affinity_max_age_seconds: int
    http_responses_session_bridge_prompt_cache_idle_ttl_seconds: int
    sticky_reallocation_budget_threshold_pct: float
    spread_new_codex_sessions: bool
    spread_new_codex_sessions_window_seconds: int
    spread_new_codex_sessions_top_pool_size: int
    import_without_overwrite: bool
    totp_required_on_login: bool
    totp_configured: bool
    api_key_auth_enabled: bool


@dataclass(frozen=True, slots=True)
class DashboardSettingsUpdateData:
    sticky_threads_enabled: bool
    upstream_stream_transport: str
    weekly_reset_preference: str
    prioritize_full_weekly_capacity: bool
    routing_strategy: str
    openai_cache_affinity_max_age_seconds: int
    http_responses_session_bridge_prompt_cache_idle_ttl_seconds: int
    sticky_reallocation_budget_threshold_pct: float
    spread_new_codex_sessions: bool
    spread_new_codex_sessions_window_seconds: int
    spread_new_codex_sessions_top_pool_size: int
    import_without_overwrite: bool
    totp_required_on_login: bool
    api_key_auth_enabled: bool


class SettingsService:
    def __init__(self, repository: SettingsRepository) -> None:
        self._repository = repository

    async def get_settings(self) -> DashboardSettingsData:
        row = await self._repository.get_or_create()
        return DashboardSettingsData(
            sticky_threads_enabled=row.sticky_threads_enabled,
            upstream_stream_transport=row.upstream_stream_transport,
            weekly_reset_preference=row.weekly_reset_preference,
            prioritize_full_weekly_capacity=row.prioritize_full_weekly_capacity,
            routing_strategy=row.routing_strategy,
            openai_cache_affinity_max_age_seconds=row.openai_cache_affinity_max_age_seconds,
            http_responses_session_bridge_prompt_cache_idle_ttl_seconds=row.http_responses_session_bridge_prompt_cache_idle_ttl_seconds,
            sticky_reallocation_budget_threshold_pct=row.sticky_reallocation_budget_threshold_pct,
            spread_new_codex_sessions=row.spread_new_codex_sessions,
            spread_new_codex_sessions_window_seconds=row.spread_new_codex_sessions_window_seconds,
            spread_new_codex_sessions_top_pool_size=row.spread_new_codex_sessions_top_pool_size,
            import_without_overwrite=row.import_without_overwrite,
            totp_required_on_login=row.totp_required_on_login,
            totp_configured=row.totp_secret_encrypted is not None,
            api_key_auth_enabled=row.api_key_auth_enabled,
        )

    async def update_settings(self, payload: DashboardSettingsUpdateData) -> DashboardSettingsData:
        current = await self._repository.get_or_create()
        if payload.totp_required_on_login and current.totp_secret_encrypted is None:
            raise ValueError("Configure TOTP before enabling login enforcement")
        row = await self._repository.update(
            sticky_threads_enabled=payload.sticky_threads_enabled,
            upstream_stream_transport=payload.upstream_stream_transport,
            weekly_reset_preference=payload.weekly_reset_preference,
            prioritize_full_weekly_capacity=payload.prioritize_full_weekly_capacity,
            routing_strategy=payload.routing_strategy,
            openai_cache_affinity_max_age_seconds=payload.openai_cache_affinity_max_age_seconds,
            http_responses_session_bridge_prompt_cache_idle_ttl_seconds=payload.http_responses_session_bridge_prompt_cache_idle_ttl_seconds,
            sticky_reallocation_budget_threshold_pct=payload.sticky_reallocation_budget_threshold_pct,
            spread_new_codex_sessions=payload.spread_new_codex_sessions,
            spread_new_codex_sessions_window_seconds=payload.spread_new_codex_sessions_window_seconds,
            spread_new_codex_sessions_top_pool_size=payload.spread_new_codex_sessions_top_pool_size,
            import_without_overwrite=payload.import_without_overwrite,
            totp_required_on_login=payload.totp_required_on_login,
            api_key_auth_enabled=payload.api_key_auth_enabled,
        )
        return DashboardSettingsData(
            sticky_threads_enabled=row.sticky_threads_enabled,
            upstream_stream_transport=row.upstream_stream_transport,
            weekly_reset_preference=row.weekly_reset_preference,
            prioritize_full_weekly_capacity=row.prioritize_full_weekly_capacity,
            routing_strategy=row.routing_strategy,
            openai_cache_affinity_max_age_seconds=row.openai_cache_affinity_max_age_seconds,
            http_responses_session_bridge_prompt_cache_idle_ttl_seconds=row.http_responses_session_bridge_prompt_cache_idle_ttl_seconds,
            sticky_reallocation_budget_threshold_pct=row.sticky_reallocation_budget_threshold_pct,
            spread_new_codex_sessions=row.spread_new_codex_sessions,
            spread_new_codex_sessions_window_seconds=row.spread_new_codex_sessions_window_seconds,
            spread_new_codex_sessions_top_pool_size=row.spread_new_codex_sessions_top_pool_size,
            import_without_overwrite=row.import_without_overwrite,
            totp_required_on_login=row.totp_required_on_login,
            totp_configured=row.totp_secret_encrypted is not None,
            api_key_auth_enabled=row.api_key_auth_enabled,
        )

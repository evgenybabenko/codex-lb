import type { DashboardSettings, SettingsUpdateRequest } from "@/features/settings/schemas";

export function buildSettingsUpdateRequest(
  settings: DashboardSettings,
  patch: Partial<SettingsUpdateRequest>,
): SettingsUpdateRequest {
  return {
    stickyThreadsEnabled: settings.stickyThreadsEnabled,
    upstreamStreamTransport: settings.upstreamStreamTransport,
    weeklyResetPreference: settings.weeklyResetPreference,
    prioritizeFullWeeklyCapacity: settings.prioritizeFullWeeklyCapacity ?? true,
    routingStrategy: settings.routingStrategy,
    openaiCacheAffinityMaxAgeSeconds: settings.openaiCacheAffinityMaxAgeSeconds,
    spreadNewCodexSessions: settings.spreadNewCodexSessions,
    spreadNewCodexSessionsWindowSeconds: settings.spreadNewCodexSessionsWindowSeconds,
    spreadNewCodexSessionsTopPoolSize: settings.spreadNewCodexSessionsTopPoolSize,
    importWithoutOverwrite: settings.importWithoutOverwrite,
    totpRequiredOnLogin: settings.totpRequiredOnLogin,
    apiKeyAuthEnabled: settings.apiKeyAuthEnabled,
    ...patch,
  };
}

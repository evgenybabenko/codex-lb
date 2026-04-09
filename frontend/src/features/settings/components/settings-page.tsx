import { Suspense, lazy } from "react";
import { AlertMessage } from "@/components/alert-message";
import { LoadingOverlay } from "@/components/layout/loading-overlay";
import { ApiKeysSection } from "@/features/api-keys/components/api-keys-section";
import { FirewallSection } from "@/features/firewall/components/firewall-section";
import { buildSettingsUpdateRequest } from "@/features/settings/payload";
import { AppearanceSettings } from "@/features/settings/components/appearance-settings";
import { PasswordSettings } from "@/features/settings/components/password-settings";
import { RoutingSettings } from "@/features/settings/components/routing-settings";
import { SettingsSkeleton } from "@/features/settings/components/settings-skeleton";
import { StickySessionsSection } from "@/features/sticky-sessions/components/sticky-sessions-section";
import { useSettings } from "@/features/settings/hooks/use-settings";
import type { SettingsUpdateRequest } from "@/features/settings/schemas";
import { useT } from "@/lib/i18n";
import { getErrorMessageOrNull } from "@/utils/errors";

const TotpSettings = lazy(() =>
  import("@/features/settings/components/totp-settings").then((m) => ({ default: m.TotpSettings })),
);

export function SettingsPage() {
  const { settingsQuery, updateSettingsMutation } = useSettings();
  const t = useT();

  const settings = settingsQuery.data;
  const busy = updateSettingsMutation.isPending;
  const error = getErrorMessageOrNull(settingsQuery.error) || getErrorMessageOrNull(updateSettingsMutation.error);

  const handleSave = async (payload: SettingsUpdateRequest) => {
    await updateSettingsMutation.mutateAsync(payload);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {!settings ? (
        <SettingsSkeleton />
      ) : (
        <>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}

          <div className="space-y-4">
            <AppearanceSettings />
            <RoutingSettings
              key={`${settings.openaiCacheAffinityMaxAgeSeconds}:${settings.spreadNewCodexSessionsWindowSeconds}:${settings.spreadNewCodexSessionsTopPoolSize}`}
              settings={settings}
              busy={busy}
              onSave={handleSave}
            />
            <PasswordSettings disabled={busy} />
            <Suspense fallback={null}>
              <TotpSettings settings={settings} disabled={busy} onSave={handleSave} />
            </Suspense>

            <ApiKeysSection
              apiKeyAuthEnabled={settings.apiKeyAuthEnabled}
              disabled={busy}
              onApiKeyAuthEnabledChange={(enabled) =>
                void handleSave(buildSettingsUpdateRequest(settings, { apiKeyAuthEnabled: enabled }))
              }
            />
            <FirewallSection />
            <StickySessionsSection />
          </div>

          <LoadingOverlay visible={!!settings && busy} label={t("settingsSaving")} />
        </>
      )}
    </div>
  );
}

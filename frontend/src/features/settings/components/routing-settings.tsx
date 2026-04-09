import { useState } from "react";
import { CircleHelp, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildSettingsUpdateRequest } from "@/features/settings/payload";
import type {
  DashboardSettings,
  SettingsUpdateRequest,
  WeeklyResetPreference,
} from "@/features/settings/schemas";
import { useT } from "@/lib/i18n";

export type RoutingSettingsProps = {
  settings: DashboardSettings;
  busy: boolean;
  onSave: (payload: SettingsUpdateRequest) => Promise<void>;
};

export function RoutingSettings({ settings, busy, onSave }: RoutingSettingsProps) {
  const t = useT();
  const [cacheAffinityTtl, setCacheAffinityTtl] = useState(
    String(settings.openaiCacheAffinityMaxAgeSeconds),
  );
  const [spreadWindowSeconds, setSpreadWindowSeconds] = useState(
    String(settings.spreadNewCodexSessionsWindowSeconds),
  );
  const [spreadTopPoolSize, setSpreadTopPoolSize] = useState(
    String(settings.spreadNewCodexSessionsTopPoolSize),
  );

  const save = (patch: Partial<SettingsUpdateRequest>) =>
    void onSave(buildSettingsUpdateRequest(settings, patch));

  const parsedCacheAffinityTtl = Number.parseInt(cacheAffinityTtl, 10);
  const cacheAffinityTtlValid = Number.isInteger(parsedCacheAffinityTtl) && parsedCacheAffinityTtl > 0;
  const cacheAffinityTtlChanged =
    cacheAffinityTtlValid && parsedCacheAffinityTtl !== settings.openaiCacheAffinityMaxAgeSeconds;
  const parsedSpreadWindowSeconds = Number.parseInt(spreadWindowSeconds, 10);
  const spreadWindowSecondsValid =
    Number.isInteger(parsedSpreadWindowSeconds) && parsedSpreadWindowSeconds > 0;
  const spreadWindowSecondsChanged =
    spreadWindowSecondsValid &&
    parsedSpreadWindowSeconds !== settings.spreadNewCodexSessionsWindowSeconds;
  const parsedSpreadTopPoolSize = Number.parseInt(spreadTopPoolSize, 10);
  const spreadTopPoolSizeValid =
    Number.isInteger(parsedSpreadTopPoolSize) && parsedSpreadTopPoolSize > 0;
  const spreadTopPoolSizeChanged =
    spreadTopPoolSizeValid &&
    parsedSpreadTopPoolSize !== settings.spreadNewCodexSessionsTopPoolSize;

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Route className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t("routingTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("routingDescription")}</p>
            </div>
          </div>
        </div>

        <div className="divide-y rounded-lg border">
          <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("routingTransportTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("routingTransportDescription")}
              </p>
            </div>
            <Select
              value={settings.upstreamStreamTransport}
              onValueChange={(value) =>
                save({ upstreamStreamTransport: value as "default" | "auto" | "http" | "websocket" })
              }
            >
              <SelectTrigger
                className="h-9 w-full min-w-0 text-xs sm:w-[18rem] lg:w-[20rem]"
                disabled={busy}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="default">{t("routingTransportServerDefault")}</SelectItem>
                <SelectItem value="auto">{t("routingTransportAuto")}</SelectItem>
                <SelectItem value="http">{t("routingTransportResponses")}</SelectItem>
                <SelectItem value="websocket">{t("routingTransportWebSockets")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t("routingStrategyTitle")}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("routingStrategyHelpAria")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    align="start"
                    className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t("routingStrategyHelpTitle")}</p>
                      <p className="text-xs text-background/80">{t("routingStrategyHelpIntro")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t("routingStrategyCapacityWeighted")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingStrategyHelpCapacityWeighted")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingStrategyHelpCapacityWeightedExample")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t("routingStrategyUsageWeighted")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingStrategyHelpUsageWeighted")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingStrategyHelpUsageWeightedExample")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t("routingStrategyRoundRobin")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingStrategyHelpRoundRobin")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingStrategyHelpRoundRobinExample")}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">{t("routingStrategyDescription")}</p>
            </div>
            <Select
              value={settings.routingStrategy}
              onValueChange={(value) => save({ routingStrategy: value as "usage_weighted" | "round_robin" | "capacity_weighted" })}
            >
              <SelectTrigger
                className="h-9 w-full min-w-0 text-xs sm:w-[18rem] lg:w-[20rem]"
                disabled={busy}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="capacity_weighted">{t("routingStrategyCapacityWeighted")}</SelectItem>
                <SelectItem value="usage_weighted">{t("routingStrategyUsageWeighted")}</SelectItem>
                <SelectItem value="round_robin">{t("routingStrategyRoundRobin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t("routingWeeklyResetTitle")}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("routingWeeklyResetHelpAria")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    align="start"
                    className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t("routingWeeklyResetHelpTitle")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingWeeklyResetHelpIntro")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t("routingWeeklyResetDisabled")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingWeeklyResetHelpDisabled")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">{t("routingWeeklyResetEarlierReset")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingWeeklyResetHelpEarlierReset")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingWeeklyResetHelpEarlierResetExample")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">
                        {t("routingWeeklyResetExpiringQuotaPriority")}
                      </p>
                      <p className="text-xs text-background/80">
                        {t("routingWeeklyResetHelpExpiringQuotaPriority")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingWeeklyResetHelpExpiringQuotaPriorityFormula")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingWeeklyResetHelpExpiringQuotaPriorityExample")}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("routingWeeklyResetDescription")}
              </p>
            </div>
            <Select
              value={settings.weeklyResetPreference}
              onValueChange={(value) =>
                save({ weeklyResetPreference: value as WeeklyResetPreference })
              }
            >
              <SelectTrigger
                className="h-9 w-full min-w-0 text-xs sm:w-[18rem] lg:w-[20rem]"
                disabled={busy}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="disabled">{t("routingWeeklyResetDisabled")}</SelectItem>
                <SelectItem value="earlier_reset">
                  {t("routingWeeklyResetEarlierReset")}
                </SelectItem>
                <SelectItem value="expiring_quota_priority">
                  {t("routingWeeklyResetExpiringQuotaPriority")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-4 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t("routingFullWeeklyPriorityTitle")}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("routingFullWeeklyPriorityHelpAria")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    align="start"
                    className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t("routingFullWeeklyPriorityHelpTitle")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingFullWeeklyPriorityHelpIntro")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-background/80">
                        {t("routingFullWeeklyPriorityHelpBehavior")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingFullWeeklyPriorityHelpExample")}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("routingFullWeeklyPriorityDescription")}
              </p>
            </div>
            <Switch
              checked={settings.prioritizeFullWeeklyCapacity ?? true}
              disabled={busy}
              onCheckedChange={(checked) => save({ prioritizeFullWeeklyCapacity: checked })}
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t("routingStickyThreads")}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("routingStickyThreadsHelpAria")}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    align="start"
                    className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t("routingStickyThreadsHelpTitle")}</p>
                      <p className="text-xs text-background/80">
                        {t("routingStickyThreadsHelpIntro")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-background/80">
                        {t("routingStickyThreadsHelpBenefit")}
                      </p>
                      <p className="text-xs text-background/70">
                        {t("routingStickyThreadsHelpExample")}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">{t("routingStickyThreadsDescription")}</p>
            </div>
            <Switch
              checked={settings.stickyThreadsEnabled}
              disabled={busy}
              onCheckedChange={(checked) => save({ stickyThreadsEnabled: checked })}
            />
          </div>

          <div className="p-3">
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-1 border-b p-3">
                <p className="text-sm font-medium">{t("routingShortMemoryTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("routingShortMemoryDescription")}
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="border-b bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {t("routingFirstPlacementTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("routingFirstPlacementDescription")}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{t("routingSpreadNewSessionsTitle")}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={t("routingSpreadNewSessionsHelpAria")}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          align="start"
                          className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{t("routingSpreadNewSessionsHelpTitle")}</p>
                            <p className="text-xs text-background/80">
                              {t("routingSpreadNewSessionsHelpIntro")}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-background/80">
                              {t("routingSpreadNewSessionsHelpBehavior")}
                            </p>
                            <p className="text-xs text-background/70">
                              {t("routingSpreadNewSessionsHelpExample")}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("routingSpreadNewSessionsDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.spreadNewCodexSessions}
                    disabled={busy}
                    onCheckedChange={(checked) => save({ spreadNewCodexSessions: checked })}
                  />
                </div>

                <div className="flex flex-col gap-3 border-t p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t("routingSpreadWindowTitle")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("routingSpreadWindowDescription")}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={spreadWindowSeconds}
                      disabled={busy || !settings.spreadNewCodexSessions}
                      onChange={(event) => setSpreadWindowSeconds(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && spreadWindowSecondsChanged) {
                          void save({ spreadNewCodexSessionsWindowSeconds: parsedSpreadWindowSeconds });
                        }
                      }}
                      className="h-9 w-full text-xs sm:w-32"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 text-xs"
                      disabled={busy || !settings.spreadNewCodexSessions || !spreadWindowSecondsChanged}
                      onClick={() => void save({ spreadNewCodexSessionsWindowSeconds: parsedSpreadWindowSeconds })}
                    >
                      {t("routingSaveWindow")}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t("routingSpreadPoolTitle")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("routingSpreadPoolDescription")}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={spreadTopPoolSize}
                      disabled={busy || !settings.spreadNewCodexSessions}
                      onChange={(event) => setSpreadTopPoolSize(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && spreadTopPoolSizeChanged) {
                          void save({ spreadNewCodexSessionsTopPoolSize: parsedSpreadTopPoolSize });
                        }
                      }}
                      className="h-9 w-full text-xs sm:w-32"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 text-xs"
                      disabled={busy || !settings.spreadNewCodexSessions || !spreadTopPoolSizeChanged}
                      onClick={() => void save({ spreadNewCodexSessionsTopPoolSize: parsedSpreadTopPoolSize })}
                    >
                      {t("routingSavePool")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="border-b bg-secondary/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    {t("routingRepeatedTrafficTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("routingRepeatedTrafficDescription")}
                  </p>
                </div>

                <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{t("routingPromptCacheTtl")}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={t("routingPromptCacheTtlHelpAria")}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          align="start"
                          className="max-w-md space-y-3 px-4 py-3 text-left leading-relaxed"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{t("routingPromptCacheTtlHelpTitle")}</p>
                            <p className="text-xs text-background/80">
                              {t("routingPromptCacheTtlHelpIntro")}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-background/80">
                              {t("routingPromptCacheTtlHelpBenefit")}
                            </p>
                            <p className="text-xs text-background/70">
                              {t("routingPromptCacheTtlHelpExample")}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("routingPromptCacheTtlDescription")}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={cacheAffinityTtl}
                      disabled={busy}
                      onChange={(event) => setCacheAffinityTtl(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && cacheAffinityTtlChanged) {
                          void save({ openaiCacheAffinityMaxAgeSeconds: parsedCacheAffinityTtl });
                        }
                      }}
                      className="h-9 w-full text-xs sm:w-32"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 text-xs"
                      disabled={busy || !cacheAffinityTtlChanged}
                      onClick={() => void save({ openaiCacheAffinityMaxAgeSeconds: parsedCacheAffinityTtl })}
                    >
                      {t("routingSaveTtl")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

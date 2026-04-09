import { useEffect, useState } from "react";
import { Activity, ArrowRightLeft, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api";
import { getSettings } from "@/features/settings/api";
import type { WeeklyResetPreference } from "@/features/settings/schemas";
import { useT } from "@/lib/i18n";
import { formatTimeLong } from "@/utils/formatters";

function getRoutingLabel(
  strategy: "usage_weighted" | "round_robin" | "capacity_weighted",
  sticky: boolean,
  weeklyResetPreference: WeeklyResetPreference,
  t: ReturnType<typeof useT>,
): string {
  const segments = [
    strategy === "round_robin"
      ? t("routingStrategyRoundRobin")
      : strategy === "capacity_weighted"
        ? t("routingStrategyCapacityWeighted")
        : t("routingStrategyUsageWeighted"),
  ];

  if (sticky) {
    segments.push(t("routingStickyThreads"));
  }

  if (weeklyResetPreference === "earlier_reset") {
    segments.push(t("routingWeeklyResetEarlierReset"));
  } else if (weeklyResetPreference === "expiring_quota_priority") {
    segments.push(t("routingWeeklyResetExpiringQuotaPriority"));
  }

  return segments.join(" + ");
}

export function StatusBar() {
  const t = useT();
  const { data: lastSyncAt = null } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    select: (data) => data.lastSyncAt,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings", "detail"],
    queryFn: getSettings,
  });
  const lastSync = formatTimeLong(lastSyncAt);
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    function check() {
      setIsLive(lastSyncAt ? Date.now() - new Date(lastSyncAt).getTime() < 60_000 : false);
    }
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [lastSyncAt]);

  const routingLabel = settings
    ? getRoutingLabel(
        settings.routingStrategy,
        settings.stickyThreadsEnabled,
        settings.weeklyResetPreference,
        t,
      )
    : "—";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-background/55 px-3 py-2.5 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-background/40 dark:shadow-[0_-1px_12px_rgba(0,0,0,0.25)] sm:px-4">
      <div className="mx-auto grid w-full max-w-[1500px] gap-2 text-[11px] text-muted-foreground sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-5 sm:gap-y-1 sm:text-xs">
        <span className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-0.5">
          {isLive ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title={t("statusBarLive")} />
          ) : (
            <Activity className="h-3 w-3" aria-hidden="true" />
          )}
          <span className="font-medium">{t("statusBarLastSync")}:</span>
          <span className="whitespace-nowrap">{lastSync.time}</span>
        </span>
        <span className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-1.5 gap-y-0.5 sm:items-center">
          <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium">{t("statusBarRouting")}:</span>
          <span className="min-w-0 break-words leading-relaxed sm:leading-normal">{routingLabel}</span>
        </span>
        <span className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-0.5 sm:justify-self-end">
          <Tag className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium">{t("commonVersion")}:</span>
          <span className="whitespace-nowrap">{__APP_VERSION__}</span>
        </span>
      </div>
    </footer>
  );
}

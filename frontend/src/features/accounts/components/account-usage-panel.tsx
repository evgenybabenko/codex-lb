import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { AccountTrendChart } from "@/features/accounts/components/account-trend-chart";
import type { AccountSummary, AccountTrendsResponse } from "@/features/accounts/schemas";
import { useT } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercentNullable,
  formatQuotaResetLabel,
  formatResetRelative,
  formatWindowLabel,
} from "@/utils/formatters";

export type AccountUsagePanelProps = {
  account: AccountSummary;
  trends?: AccountTrendsResponse | null;
};

function QuotaRow({
  percent,
  resetAt,
  remainingLabel,
  resetPrefix,
  accent,
}: {
  percent: number | null;
  resetAt: string | null | undefined;
  remainingLabel: string;
  resetPrefix: string;
  accent: "blue" | "green";
}) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const hasPercent = percent !== null;
  const accentClasses =
    accent === "blue"
      ? {
          track: "bg-blue-500/15 dark:bg-blue-400/20",
          fill: "bg-blue-500 dark:bg-blue-400",
          text: "text-blue-600 dark:text-blue-400",
        }
      : {
          track: "bg-emerald-500/15 dark:bg-emerald-400/20",
          fill: "bg-emerald-500 dark:bg-emerald-400",
          text: "text-emerald-600 dark:text-emerald-400",
        };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", accentClasses.text)}>{remainingLabel}</span>
        <span
          className={cn(
            "tabular-nums font-medium",
            hasPercent ? accentClasses.text : "text-muted-foreground",
          )}
        >
          {formatPercentNullable(percent)}
        </span>
      </div>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full", accentClasses.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", accentClasses.fill)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span>{resetPrefix} {formatQuotaResetLabel(resetAt ?? null)}</span>
      </div>
    </div>
  );
}

const ADDITIONAL_LIMIT_LABELS: Record<string, string> = {
  codex_spark: "GPT-5.3-Codex-Spark",
  codex_other: "GPT-5.3-Codex-Spark",
  "gpt-5.3-codex-spark": "GPT-5.3-Codex-Spark",
};

function formatAdditionalLimitName(limitName: string, quotaKey?: string | null): string {
  const normalizedQuotaKey = quotaKey?.trim().toLowerCase();
  if (normalizedQuotaKey && ADDITIONAL_LIMIT_LABELS[normalizedQuotaKey]) {
    return ADDITIONAL_LIMIT_LABELS[normalizedQuotaKey];
  }
  const normalized = limitName.trim().toLowerCase();
  return ADDITIONAL_LIMIT_LABELS[normalized] ?? limitName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatResetCountdown(resetAt: number | null): string | null {
  if (resetAt === null) return null;
  const diffMs = resetAt * 1000 - Date.now();
  return diffMs <= 0 ? null : formatResetRelative(diffMs);
}

function AdditionalQuotaRow({
  label,
  usedPercent,
  resetAt,
  t,
}: {
  label: string;
  usedPercent: number;
  resetAt: number | null;
  t: ReturnType<typeof useT>;
}) {
  const clamped = Math.max(0, Math.min(100, usedPercent));
  const countdown = formatResetCountdown(resetAt);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{t("accountUsagePercentUsed", { value: Math.round(usedPercent) })}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            clamped > 95
              ? "bg-red-500"
              : clamped > 80
                ? "bg-orange-500"
                : clamped > 60
                  ? "bg-amber-500"
                  : "bg-green-500",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {countdown ? (
        <p className="text-[11px] text-muted-foreground">
          {t("accountUsageResetsIn", { value: countdown })}
        </p>
      ) : null}
    </div>
  );
}

export function AccountUsagePanel({ account, trends }: AccountUsagePanelProps) {
  const t = useT();
  const primary = account.usage?.primaryRemainingPercent ?? null;
  const secondary = account.usage?.secondaryRemainingPercent ?? null;
  const requestUsage = account.requestUsage ?? null;
  const hasRequestUsage = (requestUsage?.requestCount ?? 0) > 0;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;
  const hasTrends = trends && (trends.primary.length > 0 || trends.secondary.length > 0);

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("accountUsageTitle")}</h3>
      <div className={cn("grid gap-4", weeklyOnly ? "grid-cols-1" : "grid-cols-2")}>
        {!weeklyOnly && (
          <QuotaRow
            percent={primary}
            resetAt={account.resetAtPrimary}
            remainingLabel={t("accountUsageRemaining", { label: "5h" })}
            resetPrefix={t("accountUsageReset", { value: "" }).trim()}
            accent="blue"
          />
        )}
        <QuotaRow
          percent={secondary}
          resetAt={account.resetAtSecondary}
          remainingLabel={t("accountUsageRemaining", { label: t("accountUsageWeekly") })}
          resetPrefix={t("accountUsageReset", { value: "" }).trim()}
          accent="green"
        />
      </div>
      <div className="rounded-md border bg-background/60 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("accountUsageRequestLogsTotal")}</p>
        {hasRequestUsage ? (
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {formatCompactNumber(requestUsage?.totalTokens)} {t("commonTokensShort")} |{" "}
            {formatCompactNumber(requestUsage?.cachedInputTokens)} {t("commonCachedShort")} |{" "}
            {formatCompactNumber(requestUsage?.requestCount)} {t("commonRequestsShort")} |{" "}
            {formatCurrency(requestUsage?.totalCostUsd)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{t("accountUsageNoRequestUsage")}</p>
        )}
      </div>
      {account.additionalQuotas.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("accountUsageAdditionalQuotas")}
          </p>
          {account.additionalQuotas.map((quota) => (
            <div key={quota.quotaKey ?? quota.limitName} className="rounded-md border bg-background/60 px-3 py-2 space-y-2">
              <p className="text-xs font-medium">
                {quota.displayLabel ?? formatAdditionalLimitName(quota.limitName, quota.quotaKey)}
              </p>
              {quota.primaryWindow != null ? (
                <AdditionalQuotaRow
                  label={formatWindowLabel("primary", quota.primaryWindow.windowMinutes ?? null)}
                  usedPercent={quota.primaryWindow.usedPercent}
                  resetAt={quota.primaryWindow.resetAt ?? null}
                  t={t}
                />
              ) : null}
              {quota.secondaryWindow != null ? (
                <AdditionalQuotaRow
                  label={formatWindowLabel("secondary", quota.secondaryWindow.windowMinutes ?? null)}
                  usedPercent={quota.secondaryWindow.usedPercent}
                  resetAt={quota.secondaryWindow.resetAt ?? null}
                  t={t}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {hasTrends && (
        <div className="pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("accountUsageTrend7d")}</h4>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-chart-1" />
                5h
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-chart-2" />
                {t("accountUsageWeekly")}
              </span>
            </div>
          </div>
          <AccountTrendChart primary={trends.primary} secondary={trends.secondary} />
        </div>
      )}
    </div>
  );
}

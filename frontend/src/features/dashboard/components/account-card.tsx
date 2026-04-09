import { usePrivacyStore } from "@/hooks/use-privacy";
import { StatusBadge } from "@/components/status-badge";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { ResetProgressBadge, useResetRatio } from "@/features/dashboard/components/reset-progress-badge";
import { formatWorkspaceLabel, formatWorkspaceTitle } from "@/utils/account-identifiers";
import {
  normalizeStatus,
} from "@/utils/account-status";
import { formatPercentNullable, formatQuotaResetLabel, formatSlug } from "@/utils/formatters";

type AccountAction = "details";

export type AccountCardProps = {
  account: AccountSummary;
  showAccountId?: boolean;
  onAction?: (account: AccountSummary, action: AccountAction) => void;
};

function formatCardResetLabel(label: string): string {
  if (label.startsWith("in ")) {
    return label.slice(3);
  }
  if (label.startsWith("через ")) {
    return label.slice(6);
  }
  return label;
}

function formatSubscriptionUntilLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function QuotaBar({
  label,
  percent,
  resetAt,
  windowMinutes,
  resetLabel,
  accent,
  metaPosition,
}: {
  label: string;
  percent: number | null;
  resetAt: string | null | undefined;
  windowMinutes: number | null | undefined;
  resetLabel: string;
  accent: "blue" | "green";
  metaPosition: "top" | "bottom";
}) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const hasPercent = percent !== null;
  const isTopMeta = metaPosition === "top";
  const resetRatio = useResetRatio(resetAt, windowMinutes);
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

  const metaRow = (
    <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
      <div className="flex min-w-0 items-center gap-1">
        <ResetProgressBadge ratio={resetRatio} accent={accent} />
        <span className="truncate">{formatCardResetLabel(resetLabel)}</span>
      </div>
      <span
        className={cn(
          "shrink-0 tabular-nums font-medium",
          hasPercent ? accentClasses.text : "text-muted-foreground",
        )}
      >
        {formatPercentNullable(percent)}
      </span>
    </div>
  );

  return (
    <div className="space-y-0.5">
      {isTopMeta ? <div className="pl-[1.55rem]">{metaRow}</div> : null}
      <div className="grid grid-cols-[1.15rem_minmax(0,1fr)] items-center gap-x-1">
        <div className={cn("text-[11px] font-semibold tracking-[0.04em]", accentClasses.text)}>
          {label}
        </div>
        <div className={cn("h-1.5 w-full overflow-hidden rounded-full", accentClasses.track)}>
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", accentClasses.fill)}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
      {!isTopMeta ? <div className="pl-[1.55rem]">{metaRow}</div> : null}
    </div>
  );
}

function formatAccountContextLabel(account: AccountSummary, t: ReturnType<typeof useT>): string | null {
  const workspaceLabel = formatWorkspaceLabel(account);
  if (workspaceLabel && workspaceLabel !== t("commonWorkspace")) {
    return t("accountCardContextWorkspace", { value: workspaceLabel });
  }
  if (account.planType.trim().toLowerCase() === "free") {
    return t("accountCardContextPersonalFree");
  }
  return workspaceLabel;
}

export function AccountCard({ account, showAccountId = false, onAction }: AccountCardProps) {
  const t = useT();
  const blurred = usePrivacyStore((s) => s.blurred);
  const status = normalizeStatus(account.status);
  const primaryRemaining = account.usage?.primaryRemainingPercent ?? null;
  const secondaryRemaining = account.usage?.secondaryRemainingPercent ?? null;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;

  const primaryReset = formatQuotaResetLabel(account.resetAtPrimary ?? null);
  const secondaryReset = formatQuotaResetLabel(account.resetAtSecondary ?? null);

  const title = account.email;
  const workspaceLabel = formatAccountContextLabel(account, t);
  const workspaceTitle = formatWorkspaceTitle(account);
  const subscriptionUntil = formatSubscriptionUntilLabel(account.auth?.subscriptionActiveUntil);
  const subtitle = [
    workspaceLabel ?? formatSlug(account.planType),
    subscriptionUntil ? t("commonUntil", { value: subscriptionUntil }) : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <button
      type="button"
      className="card-hover w-full rounded-xl border bg-card p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={() => onAction?.(account, "details")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {blurred
              ? <span className="privacy-blur">{title}</span>
              : title}
          </p>
          <p
            className="mt-0.5 truncate text-xs text-muted-foreground"
            title={[
              workspaceTitle,
              showAccountId ? t("accountTooltipId", { id: account.accountId }) : null,
            ].filter(Boolean).join(" | ") || undefined}
          >
            {subtitle}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Quota bars */}
      <div className="mt-3.5 space-y-0">
        {!weeklyOnly && (
          <QuotaBar
            label={t("dashboardUsagePrimaryTitle")}
            percent={primaryRemaining}
            resetAt={account.resetAtPrimary}
            windowMinutes={account.windowMinutesPrimary}
            resetLabel={primaryReset}
            accent="blue"
            metaPosition="top"
          />
        )}
        <QuotaBar
          label={t("dashboardUsageSecondaryTitle")}
          percent={secondaryRemaining}
          resetAt={account.resetAtSecondary}
          windowMinutes={account.windowMinutesSecondary}
          resetLabel={secondaryReset}
          accent="green"
          metaPosition="bottom"
        />
      </div>
    </button>
  );
}

import { Clock, ExternalLink, Play, RotateCcw } from "lucide-react";

import { usePrivacyStore } from "@/hooks/use-privacy";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { formatWorkspaceLabel, formatWorkspaceTitle } from "@/utils/account-identifiers";
import {
  normalizeStatus,
} from "@/utils/account-status";
import { formatPercentNullable, formatQuotaResetLabel, formatSlug } from "@/utils/formatters";

type AccountAction = "details" | "resume" | "reauth";

export type AccountCardProps = {
  account: AccountSummary;
  showAccountId?: boolean;
  onAction?: (account: AccountSummary, action: AccountAction) => void;
};

function formatCardResetLabel(label: string): string {
  return label.startsWith("in ") ? label.slice(3) : label;
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
  resetLabel,
  accent,
  metaPosition,
}: {
  label: string;
  percent: number | null;
  resetLabel: string;
  accent: "blue" | "green";
  metaPosition: "top" | "bottom";
}) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const hasPercent = percent !== null;
  const isTopMeta = metaPosition === "top";
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
        <Clock className="h-3 w-3 shrink-0" />
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

function formatAccountContextLabel(account: AccountSummary): string | null {
  const workspaceLabel = formatWorkspaceLabel(account);
  if (workspaceLabel && workspaceLabel !== "Workspace") {
    return `Workspace | ${workspaceLabel}`;
  }
  if (account.planType.trim().toLowerCase() === "free") {
    return "Personal | Free";
  }
  return workspaceLabel;
}

export function AccountCard({ account, showAccountId = false, onAction }: AccountCardProps) {
  const blurred = usePrivacyStore((s) => s.blurred);
  const status = normalizeStatus(account.status);
  const primaryRemaining = account.usage?.primaryRemainingPercent ?? null;
  const secondaryRemaining = account.usage?.secondaryRemainingPercent ?? null;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;

  const primaryReset = formatQuotaResetLabel(account.resetAtPrimary ?? null);
  const secondaryReset = formatQuotaResetLabel(account.resetAtSecondary ?? null);

  const title = account.email;
  const workspaceLabel = formatAccountContextLabel(account);
  const workspaceTitle = formatWorkspaceTitle(account);
  const subscriptionUntil = formatSubscriptionUntilLabel(account.auth?.subscriptionActiveUntil);
  const subtitle = [
    workspaceLabel ?? formatSlug(account.planType),
    subscriptionUntil ? `until ${subscriptionUntil}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="card-hover rounded-xl border bg-card p-4">
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
            title={[workspaceTitle, showAccountId ? `Account ID ${account.accountId}` : null].filter(Boolean).join(" | ") || undefined}
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
            label="5h"
            percent={primaryRemaining}
            resetLabel={primaryReset}
            accent="blue"
            metaPosition="top"
          />
        )}
        <QuotaBar
          label="7d"
          percent={secondaryRemaining}
          resetLabel={secondaryReset}
          accent="green"
          metaPosition="bottom"
        />
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t pt-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onAction?.(account, "details")}
        >
          <ExternalLink className="h-3 w-3" />
          Details
        </Button>
        {status === "paused" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 rounded-lg text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={() => onAction?.(account, "resume")}
          >
            <Play className="h-3 w-3" />
            Resume
          </Button>
        )}
        {status === "deactivated" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 rounded-lg text-xs text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={() => onAction?.(account, "reauth")}
          >
            <RotateCcw className="h-3 w-3" />
            Re-auth
          </Button>
        )}
      </div>
    </div>
  );
}

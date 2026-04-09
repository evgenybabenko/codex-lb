import { ResetProgressBadge, useResetRatio } from "@/features/dashboard/components/reset-progress-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isEmailLabel } from "@/components/blur-email";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { StatusBadge } from "@/components/status-badge";
import type { AccountSummary } from "@/features/accounts/schemas";
import { useT } from "@/lib/i18n";
import { normalizeStatus } from "@/utils/account-status";
import { formatWorkspaceLabel, formatWorkspaceTitle } from "@/utils/account-identifiers";
import { formatCompactMetricNumber, formatPercentNullable, formatQuotaResetLabel } from "@/utils/formatters";

export type AccountListItemProps = {
  account: AccountSummary;
  selected: boolean;
  showAccountId?: boolean;
  onSelect: (accountId: string) => void;
};

function buildQuotaTooltip({
  percent,
  remainingCredits,
  capacityCredits,
}: {
  percent: number | null;
  remainingCredits: number | null | undefined;
  capacityCredits: number | null | undefined;
}): string {
  const percentLabel = formatPercentNullable(percent);
  if (remainingCredits == null || capacityCredits == null || capacityCredits <= 0) {
    return percentLabel;
  }
  return `${percentLabel} • ${formatCompactMetricNumber(remainingCredits)}/${formatCompactMetricNumber(capacityCredits)}`;
}

function MiniQuotaBar({
  percent,
  accent,
  testId,
}: {
  percent: number | null;
  accent: "blue" | "green";
  testId: string;
}) {
  if (percent === null) {
    return <div data-testid={`${testId}-track`} className="h-1 flex-1 overflow-hidden rounded-full bg-muted" />;
  }
  const clamped = Math.max(0, Math.min(100, percent));
  const accentClass =
    accent === "blue"
      ? {
          track: "bg-blue-500/15 dark:bg-blue-400/20",
          fill: "bg-blue-500 dark:bg-blue-400",
        }
      : {
          track: "bg-emerald-500/15 dark:bg-emerald-400/20",
          fill: "bg-emerald-500 dark:bg-emerald-400",
        };
  return (
    <div data-testid={`${testId}-track`} className={cn("h-1 flex-1 overflow-hidden rounded-full", accentClass.track)}>
      <div
        data-testid={`${testId}-fill`}
        className={cn("h-full rounded-full", accentClass.fill)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function AccountListItem({ account, selected, showAccountId = false, onSelect }: AccountListItemProps) {
  const t = useT();
  const blurred = usePrivacyStore((s) => s.blurred);
  const status = normalizeStatus(account.status);
  const title = account.email;
  const titleIsEmail = isEmailLabel(title, account.email);
  const workspaceLabel = formatWorkspaceLabel(account);
  const workspaceTitle = formatWorkspaceTitle(account);
  const baseSubtitle = workspaceLabel
    ? t("accountCardContextWorkspace", { value: workspaceLabel })
    : account.planType;
  const primary = account.usage?.primaryRemainingPercent ?? null;
  const secondary = account.usage?.secondaryRemainingPercent ?? null;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;
  const primaryResetRatio = useResetRatio(account.resetAtPrimary, account.windowMinutesPrimary);
  const secondaryResetRatio = useResetRatio(account.resetAtSecondary, account.windowMinutesSecondary);
  const primaryTooltip = buildQuotaTooltip({
    percent: primary,
    remainingCredits: account.remainingCreditsPrimary,
    capacityCredits: account.capacityCreditsPrimary,
  });
  const secondaryTooltip = buildQuotaTooltip({
    percent: secondary,
    remainingCredits: account.remainingCreditsSecondary,
    capacityCredits: account.capacityCreditsSecondary,
  });
  const primaryResetTooltip = formatQuotaResetLabel(account.resetAtPrimary ?? null);
  const secondaryResetTooltip = formatQuotaResetLabel(account.resetAtSecondary ?? null);

  return (
    <TooltipProvider>
      <button
        type="button"
        onClick={() => onSelect(account.accountId)}
        className={cn(
          "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
          selected
            ? "bg-primary/8 ring-1 ring-primary/25"
            : "hover:bg-muted/50",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {titleIsEmail && blurred ? <span className="privacy-blur">{title}</span> : title}
            </p>
            <p
              className="truncate text-xs text-muted-foreground"
              title={
                [workspaceTitle, showAccountId ? t("accountTooltipId", { id: account.accountId }) : null]
                  .filter(Boolean)
                  .join(" | ") || undefined
              }
            >
              {baseSubtitle}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className={cn("mt-1.5 grid gap-2", weeklyOnly ? "grid-cols-1" : "grid-cols-2")}>
          {!weeklyOnly ? (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex min-w-0 flex-1 items-center">
                      <MiniQuotaBar percent={primary} accent="blue" testId="mini-quota-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{primaryTooltip}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <ResetProgressBadge
                        ratio={primaryResetRatio}
                        accent="blue"
                        className="h-4 w-4"
                        iconClassName="h-[9px] w-[9px]"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{primaryResetTooltip}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex min-w-0 flex-1 items-center">
                    <MiniQuotaBar percent={secondary} accent="green" testId="mini-quota-secondary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{secondaryTooltip}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ResetProgressBadge
                      ratio={secondaryResetRatio}
                      accent="green"
                      className="h-4 w-4"
                      iconClassName="h-[9px] w-[9px]"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{secondaryResetTooltip}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </button>
    </TooltipProvider>
  );
}

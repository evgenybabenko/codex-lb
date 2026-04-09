import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpWideNarrow,
  Building2,
  ChevronDown,
  ChevronUp,
  ClockArrowDown,
  ClockArrowUp,
  Mail,
  Users,
} from "lucide-react";

import { DonutChart } from "@/components/donut-chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  defaultDirectionForField,
  sortDashboardAccounts,
  toggleSortState,
  type DashboardSortField,
  type DashboardSortState,
} from "@/features/dashboard/components/account-sort";
import { ResetProgressBadge, useResetRatio } from "@/features/dashboard/components/reset-progress-badge";
import type { AccountSummary } from "@/features/dashboard/schemas";
import type { RemainingItem, SafeLineView } from "@/features/dashboard/utils";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCompactMetricNumber, toNumber } from "@/utils/formatters";

const TABLE_GRID_COLUMNS =
  "grid-cols-[minmax(124px,2.55fr)_minmax(52px,0.55fr)_58px_28px_58px_28px] md:grid-cols-[minmax(178px,3fr)_minmax(56px,0.42fr)_84px_84px_84px_84px] lg:grid-cols-[minmax(188px,3.05fr)_minmax(60px,0.45fr)_90px_90px_90px_90px] xl:grid-cols-[minmax(198px,3.1fr)_minmax(66px,0.5fr)_102px_96px_102px_96px] 2xl:grid-cols-[minmax(208px,3.15fr)_minmax(72px,0.56fr)_116px_100px_116px_100px]";
const TABLE_MIN_WIDTH = "min-w-[348px] md:min-w-[572px] lg:min-w-[620px] xl:min-w-[680px] 2xl:min-w-[724px]";
const COLUMN_INSET = "pl-1.5 md:pl-2";

type CombinedUsageRowProps = {
  account: AccountSummary;
  primaryItem?: RemainingItem;
  secondaryItem?: RemainingItem;
  blurred: boolean;
  index: number;
};

function SortHeaderButton({
  field,
  sort,
  onChange,
  align = "center",
  tone,
  ariaLabel,
  className,
}: {
  field: DashboardSortField;
  sort: DashboardSortState;
  onChange: (next: DashboardSortState) => void;
  align?: "start" | "center";
  tone?: "blue" | "green";
  ariaLabel: string;
  className?: string;
}) {
  const active = sort.field === field;
  const direction = active ? sort.direction : defaultDirectionForField(field);
  const isAscending = direction === "asc";

  const icon = (() => {
    if (field === "email") {
      return (
        <>
          <Mail className="h-4 w-4" />
          {isAscending ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />}
        </>
      );
    }

    if (field === "workspace") {
      return (
        <>
          <Building2 className="h-4 w-4" />
          {isAscending ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />}
        </>
      );
    }

    if (field === "primary_remaining" || field === "secondary_remaining") {
      return isAscending ? <ArrowUpWideNarrow className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />;
    }

    return isAscending ? <ClockArrowUp className="h-4 w-4" /> : <ClockArrowDown className="h-4 w-4" />;
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onChange(toggleSortState(sort, field))}
          aria-label={ariaLabel}
          className={cn(
            "flex h-8 w-full items-center rounded-md bg-muted/35 text-muted-foreground transition-colors hover:bg-muted/45",
            align === "start" ? "justify-start px-2" : "justify-center px-0",
            tone === "blue" ? "text-blue-600 dark:text-blue-400" : "",
            tone === "green" ? "text-emerald-600 dark:text-emerald-400" : "",
            active ? "ring-1 ring-border" : "",
            className,
          )}
        >
          <span className="inline-flex items-center gap-0.5">{icon}</span>
          {active ? (
            isAscending ? <ChevronUp className="ml-0.5 h-3 w-3 shrink-0" /> : <ChevronDown className="ml-0.5 h-3 w-3 shrink-0" />
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>{ariaLabel}</TooltipContent>
    </Tooltip>
  );
}

export type UsageDonutsProps = {
  accounts: AccountSummary[];
  primaryItems: RemainingItem[];
  secondaryItems: RemainingItem[];
  primaryTotal: number;
  secondaryTotal: number;
  safeLinePrimary?: SafeLineView | null;
  safeLineSecondary?: SafeLineView | null;
};

function formatUsageMetric(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "--";
  }

  const compactLowercase = (formatted: string) => formatted.replace(/([KMBT])$/, (match) => match.toLowerCase());

  if (Math.abs(numeric) < 1_000) {
    return formatCompactMetricNumber(Math.round(numeric));
  }

  return compactLowercase(formatCompactMetricNumber(numeric));
}

function ResourceCell({
  item,
  accent,
}: {
  item?: RemainingItem;
  accent: "blue" | "green";
}) {
  if (!item) {
    return <span className={cn("justify-self-start tabular-nums text-[11px] text-muted-foreground", COLUMN_INSET)}>-</span>;
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-start gap-1 justify-self-start text-left", COLUMN_INSET)}>
      <span className="whitespace-nowrap tabular-nums text-[10px] leading-none text-muted-foreground md:text-[11px]">
        {item.capacityValue && item.capacityValue > 0
          ? `${formatUsageMetric(item.value)}/${formatUsageMetric(item.capacityValue)}`
          : formatUsageMetric(item.value)}
      </span>
      <span className="h-2 w-[40px] max-w-full overflow-hidden rounded-full bg-muted/70 md:w-[64px] lg:w-[70px] xl:w-[82px] 2xl:w-[92px]">
        <span
          className={cn(
            "block h-full rounded-full",
            accent === "green" ? "bg-emerald-400/90" : "bg-blue-400/90",
          )}
          style={{ width: `${Math.max(0, Math.min(100, item.remainingPercent ?? 0))}%` }}
        />
      </span>
    </div>
  );
}

function ResetCell({
  item,
  accent,
}: {
  item?: RemainingItem;
  accent: "blue" | "green";
}) {
  const ratio = useResetRatio(item?.resetAt, item?.windowMinutes);
  const label = item?.resetLabel ?? "-";

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex min-w-0 items-center justify-start justify-self-start md:hidden", COLUMN_INSET)}>
            <ResetProgressBadge
              ratio={ratio}
              accent={accent}
              className="h-6 w-6"
              iconClassName="h-3.5 w-3.5"
            />
            <span className="sr-only">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="md:hidden">{label}</TooltipContent>
      </Tooltip>
      <span className={cn("hidden min-w-0 items-center justify-self-start md:inline-flex md:w-full md:justify-start md:gap-2", COLUMN_INSET)}>
        <ResetProgressBadge
          ratio={ratio}
          accent={accent}
          className="h-6 w-6"
          iconClassName="h-3.5 w-3.5"
        />
        <span className="truncate text-[11px] text-muted-foreground">{label}</span>
      </span>
    </>
  );
}

function CombinedUsageRow({
  account,
  primaryItem,
  secondaryItem,
  blurred,
  index,
}: CombinedUsageRowProps) {
  const displayItem = primaryItem ?? secondaryItem;
  const displayLabel =
    displayItem?.label ?? account.displayName ?? account.email ?? account.accountId;
  const workspaceLabel =
    displayItem?.workspaceLabel ?? account.workspaceName ?? account.workspaceId ?? "—";

  return (
    <div
      className={cn(
        `grid ${TABLE_GRID_COLUMNS} ${TABLE_MIN_WIDTH} items-center gap-x-2 gap-y-0.5 px-1.5 py-1.5 text-xs md:gap-x-2.5`,
        index % 2 === 0 ? "bg-background/70" : "bg-muted/10",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: displayItem?.color }}
        />
        <span className="truncate font-medium">
          {displayItem?.isEmail && blurred ? (
            <span className="privacy-blur">{displayLabel}</span>
          ) : (
            displayLabel
          )}
        </span>
      </div>
      <span className="truncate pl-1 text-[11px] text-muted-foreground md:ml-1 md:pl-1.5">{workspaceLabel}</span>
      <ResourceCell item={primaryItem} accent="blue" />
      <ResetCell item={primaryItem} accent="blue" />
      <ResourceCell item={secondaryItem} accent="green" />
      <ResetCell item={secondaryItem} accent="green" />
    </div>
  );
}

export function UsageDonuts({
  accounts,
  primaryItems,
  secondaryItems,
  primaryTotal,
  secondaryTotal,
  safeLinePrimary,
  safeLineSecondary,
}: UsageDonutsProps) {
  const t = useT();
  const blurred = usePrivacyStore((s) => s.blurred);
  const [sort, setSort] = useState<DashboardSortState>({ field: "email", direction: "asc" });

  const primaryValueByAccountId = useMemo(
    () => new Map(primaryItems.map((item) => [item.accountId, item.value])),
    [primaryItems],
  );
  const secondaryValueByAccountId = useMemo(
    () => new Map(secondaryItems.map((item) => [item.accountId, item.value])),
    [secondaryItems],
  );

  const sortedAccounts = useMemo(() => {
    const base = sortDashboardAccounts(accounts, sort);

    if (sort.field === "primary_remaining") {
      return base.sort((left, right) => {
        const leftValue = primaryValueByAccountId.get(left.accountId) ?? -1;
        const rightValue = primaryValueByAccountId.get(right.accountId) ?? -1;
        return sort.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
      });
    }

    if (sort.field === "secondary_remaining") {
      return base.sort((left, right) => {
        const leftValue = secondaryValueByAccountId.get(left.accountId) ?? -1;
        const rightValue = secondaryValueByAccountId.get(right.accountId) ?? -1;
        return sort.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
      });
    }

    if (sort.field === "primary_reset") {
      return base.sort((left, right) => {
        const leftTs = left.resetAtPrimary ? new Date(left.resetAtPrimary).getTime() : Number.POSITIVE_INFINITY;
        const rightTs = right.resetAtPrimary ? new Date(right.resetAtPrimary).getTime() : Number.POSITIVE_INFINITY;
        return sort.direction === "asc" ? leftTs - rightTs : rightTs - leftTs;
      });
    }

    if (sort.field === "secondary_reset") {
      return base.sort((left, right) => {
        const leftTs = left.resetAtSecondary ? new Date(left.resetAtSecondary).getTime() : Number.POSITIVE_INFINITY;
        const rightTs = right.resetAtSecondary ? new Date(right.resetAtSecondary).getTime() : Number.POSITIVE_INFINITY;
        return sort.direction === "asc" ? leftTs - rightTs : rightTs - leftTs;
      });
    }

    return base;
  }, [accounts, primaryValueByAccountId, secondaryValueByAccountId, sort]);

  const sortRank = useMemo(
    () => new Map(sortedAccounts.map((account, index) => [account.accountId, index])),
    [sortedAccounts],
  );

  const primaryChartItems = useMemo(
    () =>
      primaryItems
        .slice()
        .sort(
          (left, right) =>
            (sortRank.get(left.accountId) ?? Number.MAX_SAFE_INTEGER) -
            (sortRank.get(right.accountId) ?? Number.MAX_SAFE_INTEGER),
        )
        .map((item) => ({
          id: item.accountId,
          label: item.label,
          workspaceLabel: item.workspaceLabel,
          resetLabel: item.resetLabel,
          resetAt: item.resetAt,
          windowMinutes: item.windowMinutes,
          isEmail: item.isEmail,
          value: item.value,
          capacityValue: item.capacityValue,
          remainingPercent: item.remainingPercent,
          color: item.color,
        })),
    [primaryItems, sortRank],
  );

  const secondaryChartItems = useMemo(
    () =>
      secondaryItems
        .slice()
        .sort(
          (left, right) =>
            (sortRank.get(left.accountId) ?? Number.MAX_SAFE_INTEGER) -
            (sortRank.get(right.accountId) ?? Number.MAX_SAFE_INTEGER),
        )
        .map((item) => ({
          id: item.accountId,
          label: item.label,
          workspaceLabel: item.workspaceLabel,
          resetLabel: item.resetLabel,
          resetAt: item.resetAt,
          windowMinutes: item.windowMinutes,
          isEmail: item.isEmail,
          value: item.value,
          capacityValue: item.capacityValue,
          remainingPercent: item.remainingPercent,
          color: item.color,
        })),
    [secondaryItems, sortRank],
  );

  const primaryItemMap = useMemo(
    () => new Map(primaryItems.map((item) => [item.accountId, item])),
    [primaryItems],
  );
  const secondaryItemMap = useMemo(
    () => new Map(secondaryItems.map((item) => [item.accountId, item])),
    [secondaryItems],
  );

  const primaryRemainingTotal = useMemo(
    () => primaryItems.reduce((sum, item) => sum + Math.max(0, item.value), 0),
    [primaryItems],
  );
  const secondaryRemainingTotal = useMemo(
    () => secondaryItems.reduce((sum, item) => sum + Math.max(0, item.value), 0),
    [secondaryItems],
  );

  const uniqueEmailCount = useMemo(
    () =>
      new Set(
        accounts
          .map((account) => account.email.trim().toLowerCase())
          .filter((value) => value.length > 0),
      ).size,
    [accounts],
  );
  const uniqueWorkspaceCount = useMemo(
    () =>
      new Set(
        accounts
          .map((account) => (account.workspaceName || account.workspaceId || "").trim())
          .filter((value) => value.length > 0),
      ).size,
    [accounts],
  );
  const accountCount = accounts.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("dashboardDonutRemaining")}
        </h2>
        <div className="h-px flex-1 bg-border" />
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{t("dashboardAccounts")}: {accountCount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            <span>{t("dashboardSummaryEmails")}: {uniqueEmailCount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>{t("dashboardSummaryGroups")}: {uniqueWorkspaceCount}</span>
          </span>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div className="flex shrink-0 flex-col items-center gap-4 self-center lg:self-stretch lg:pr-2">
            <div className="flex flex-row justify-center gap-6 lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-evenly lg:gap-4">
              <div className="flex flex-col items-center gap-2">
                <DonutChart
                  title={t("dashboardUsagePrimaryTitle")}
                  items={primaryChartItems}
                  total={primaryTotal}
                  centerValue={primaryRemainingTotal}
                  layout="chart-only"
                  safeLine={safeLinePrimary}
                  timeAccent="blue"
                  className="w-auto"
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboardUsagePrimaryTitle")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <DonutChart
                  title={t("dashboardUsageSecondaryTitle")}
                  items={secondaryChartItems}
                  total={secondaryTotal}
                  centerValue={secondaryRemainingTotal}
                  layout="chart-only"
                  safeLine={safeLineSecondary}
                  timeAccent="green"
                  className="w-auto"
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboardUsageSecondaryTitle")}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <TooltipProvider>
              <div className={cn(`grid ${TABLE_GRID_COLUMNS} ${TABLE_MIN_WIDTH} gap-x-2 border-b pb-2 text-[11px] text-muted-foreground md:gap-x-2.5`)}>
                <SortHeaderButton
                  field="email"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  ariaLabel={t("dashboardAccountSortEmail")}
                  className="pl-1.5"
                />
                <SortHeaderButton
                  field="workspace"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  ariaLabel={t("dashboardAccountSortWorkspace")}
                  className="pl-1"
                />
                <SortHeaderButton
                  field="primary_remaining"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  tone="blue"
                  ariaLabel={t("dashboardAccountSortPrimaryRemaining")}
                  className={COLUMN_INSET}
                />
                <SortHeaderButton
                  field="primary_reset"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  tone="blue"
                  ariaLabel={t("dashboardAccountSortPrimaryReset")}
                  className={COLUMN_INSET}
                />
                <SortHeaderButton
                  field="secondary_remaining"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  tone="green"
                  ariaLabel={t("dashboardAccountSortSecondaryRemaining")}
                  className={COLUMN_INSET}
                />
                <SortHeaderButton
                  field="secondary_reset"
                  sort={sort}
                  onChange={setSort}
                  align="start"
                  tone="green"
                  ariaLabel={t("dashboardAccountSortSecondaryReset")}
                  className={COLUMN_INSET}
                />
              </div>
              <div className="mt-1.5 space-y-1">
                {sortedAccounts.map((account, index) => (
                  <CombinedUsageRow
                    key={account.accountId}
                    account={account}
                    primaryItem={primaryItemMap.get(account.accountId)}
                    secondaryItem={secondaryItemMap.get(account.accountId)}
                    blurred={blurred}
                    index={index}
                  />
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </section>
  );
}

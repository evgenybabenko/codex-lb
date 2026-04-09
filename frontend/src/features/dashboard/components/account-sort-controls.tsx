import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpWideNarrow,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock3,
  ClockArrowDown,
  ClockArrowUp,
  Mail,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  defaultDirectionForField,
  toggleSortState,
  type DashboardSortDirection,
  type DashboardSortField,
  type DashboardSortState,
} from "@/features/dashboard/components/account-sort";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SortOption = {
  value: DashboardSortField;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "primary" | "secondary";
};

const COLUMN_LAYOUT_GRID =
  "grid-cols-[minmax(0,3.05fr)_minmax(58px,0.62fr)_minmax(72px,0.66fr)_minmax(66px,0.56fr)] md:grid-cols-[minmax(0,2.85fr)_minmax(64px,0.62fr)_minmax(88px,0.68fr)_minmax(78px,0.58fr)]";

function SortGlyph({
  LeadingIcon,
  SortIcon,
  className,
}: {
  LeadingIcon: ComponentType<{ className?: string }>;
  SortIcon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-max items-center justify-center gap-0.5", className)}>
      <LeadingIcon className="h-[1.05rem] w-[1.05rem]" />
      <SortIcon className="h-[0.95rem] w-[0.95rem]" />
    </span>
  );
}

function MailSortIcon({
  direction,
  className,
}: {
  direction: DashboardSortDirection;
  className?: string;
}) {
  return (
    <SortGlyph
      LeadingIcon={Mail}
      SortIcon={direction === "asc" ? ArrowUpAZ : ArrowDownAZ}
      className={className}
    />
  );
}

function WorkspaceSortIcon({
  direction,
  className,
}: {
  direction: DashboardSortDirection;
  className?: string;
}) {
  return (
    <SortGlyph
      LeadingIcon={Building2}
      SortIcon={direction === "asc" ? ArrowUpAZ : ArrowDownAZ}
      className={className}
    />
  );
}


export type AccountSortControlsProps = {
  sort: DashboardSortState;
  onChange: (next: DashboardSortState) => void;
  compact?: boolean;
  options?: DashboardSortField[];
  labelOverrides?: Partial<Record<DashboardSortField, string>>;
  layout?: "toolbar" | "columns";
  columnsClassName?: string;
  iconOnly?: boolean;
  columnAlign?: "start" | "center";
  buttonClassName?: string;
  className?: string;
  appearance?: "default" | "bare";
  badgePlacement?: "center" | "end";
};

function getWindowBadgeLabel(
  field: DashboardSortField,
  t: ReturnType<typeof useT>,
): string | null {
  if (field === "primary_remaining" || field === "primary_reset") {
    return t("dashboardUsagePrimaryTitle");
  }
  if (field === "secondary_remaining" || field === "secondary_reset") {
    return t("dashboardUsageSecondaryTitle");
  }
  return null;
}

export function AccountSortControls({
  sort,
  onChange,
  compact = false,
  options,
  labelOverrides,
  layout = "toolbar",
  columnsClassName,
  iconOnly = false,
  columnAlign = "start",
  buttonClassName,
  className,
  appearance = "default",
  badgePlacement = "center",
}: AccountSortControlsProps) {
  const t = useT();
  const allOptions: SortOption[] = [
    { value: "email", label: t("dashboardAccountSortEmail"), icon: Mail },
    { value: "workspace", label: t("dashboardAccountSortWorkspace"), icon: Building2 },
    { value: "primary_remaining", label: t("dashboardAccountSortPrimaryRemaining"), icon: ArrowDownWideNarrow, tone: "primary" },
    { value: "secondary_remaining", label: t("dashboardAccountSortSecondaryRemaining"), icon: ArrowDownWideNarrow, tone: "secondary" },
    { value: "primary_reset", label: t("dashboardAccountSortPrimaryReset"), icon: Clock3, tone: "primary" },
    { value: "secondary_reset", label: t("dashboardAccountSortSecondaryReset"), icon: Clock3, tone: "secondary" },
  ];
  const optionMap = new Map(allOptions.map((option) => [option.value, option]));
  const orderedOptions = options
    ? options
        .map((value) => optionMap.get(value))
        .filter((option): option is SortOption => option != null)
    : allOptions;
  const sortOptions = orderedOptions.map((option) => ({
    ...option,
    label: labelOverrides?.[option.value] ?? option.label,
  }));

  const isColumns = layout === "columns";

  return (
    <TooltipProvider>
      <div
        className={cn(
          isColumns
            ? cn("grid gap-x-3", columnsClassName ?? COLUMN_LAYOUT_GRID)
            : "flex flex-wrap items-center gap-1.5",
          !isColumns && (compact ? "justify-end" : "justify-start"),
          className,
        )}
        aria-label={t("dashboardAccountSortLabel")}
      >
        {sortOptions.map((option) => {
          const active = option.value === sort.field;
          const direction = active ? sort.direction : defaultDirectionForField(option.value);
          const isRemainingField =
            option.value === "primary_remaining" || option.value === "secondary_remaining";
          const isResetField =
            option.value === "primary_reset" || option.value === "secondary_reset";
          const badgeLabel = !isColumns ? getWindowBadgeLabel(option.value, t) : null;
          const showStandaloneDirection = isColumns && !iconOnly && active;
          const Icon =
            isRemainingField
              ? direction === "asc"
                ? ArrowUpWideNarrow
                : ArrowDownWideNarrow
              : isResetField
                ? direction === "asc"
                  ? ClockArrowUp
                  : ClockArrowDown
                : option.value === "email"
                  ? ((props: { className?: string }) => (
                      <MailSortIcon direction={direction} className={props.className} />
                    ))
                  : option.value === "workspace"
                    ? ((props: { className?: string }) => (
                        <WorkspaceSortIcon direction={direction} className={props.className} />
                      ))
                : option.icon;
          const DirectionIcon = direction === "asc" ? ChevronUp : ChevronDown;
          const accentClass =
            appearance === "bare"
              ? option.tone === "primary"
                ? "text-blue-600 dark:text-blue-400"
                : option.tone === "secondary"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              : option.tone === "primary"
                ? active
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-blue-600/80 dark:text-blue-400/80"
                : option.tone === "secondary"
                  ? active
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-emerald-600/80 dark:text-emerald-400/80"
                  : active
                    ? "border-primary bg-primary/10 text-primary"
                    : "";
          return (
            <Tooltip key={option.value}>
              <div className={cn(isColumns ? "flex w-full" : "")}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size={isColumns ? "default" : "icon"}
                    onClick={() => onChange(toggleSortState(sort, option.value))}
                    className={cn(
                      "relative rounded-lg",
                      isColumns
                        ? iconOnly
                          ? "h-8 w-full rounded-none border-0 bg-muted/35 px-0 text-[11px] shadow-none hover:bg-muted/45"
                          : "h-8 w-full justify-start gap-1.5 rounded-none border-0 px-0 text-[11px] shadow-none hover:bg-transparent"
                        : compact
                          ? "h-8 w-8"
                          : "h-8 w-8",
                      !isColumns && badgeLabel ? "items-start pt-1.5" : "",
                      !isColumns && appearance === "bare" ? "rounded-none border-0 bg-transparent shadow-none hover:bg-transparent" : "",
                      accentClass,
                      buttonClassName,
                    )}
                    aria-label={`${option.label} (${direction === "asc" ? t("commonAscending") : t("commonDescending")})`}
                  >
                    {isColumns && iconOnly ? (
                      <span
                        className={cn(
                          "flex w-full items-center",
                          columnAlign === "center" ? "justify-center" : "justify-start pl-3",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : (
                      <Icon className={compact ? "h-5 w-5" : "h-5 w-5"} />
                    )}
                    {isColumns && !iconOnly ? <span className="truncate">{option.label}</span> : null}
                    {!isColumns && badgeLabel ? (
                      <span
                        className={cn(
                          "absolute text-[10px] font-semibold leading-3",
                          badgePlacement === "end"
                            ? "bottom-0.5 right-0"
                            : "bottom-0.5 left-1/2 -translate-x-1/2",
                        )}
                      >
                        {badgeLabel}
                      </span>
                    ) : null}
                    {showStandaloneDirection ? (
                      <DirectionIcon className={cn("h-3 w-3", isColumns ? "absolute -right-2 top-1/2 -translate-y-1/2 shrink-0 bg-background" : "absolute -bottom-1 right-0 rounded-full bg-background/90")} />
                    ) : null}
                  </Button>
                </TooltipTrigger>
              </div>
              <TooltipContent sideOffset={6}>
                {option.label}
                {" · "}
                {direction === "asc" ? t("commonAscending") : t("commonDescending")}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

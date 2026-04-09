import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AlertMessage } from "@/components/alert-message";
import { useAccountMutations } from "@/features/accounts/hooks/use-accounts";
import { AccountCards } from "@/features/dashboard/components/account-cards";
import {
  AccountSortControls,
} from "@/features/dashboard/components/account-sort-controls";
import {
  sortDashboardAccounts,
  type DashboardSortState,
} from "@/features/dashboard/components/account-sort";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { RequestFilters } from "@/features/dashboard/components/filters/request-filters";
import { RecentRequestsTable } from "@/features/dashboard/components/recent-requests-table";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { UsageDonuts } from "@/features/dashboard/components/usage-donuts";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useRequestLogs } from "@/features/dashboard/hooks/use-request-logs";
import { buildDashboardView } from "@/features/dashboard/utils";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { useThemeStore } from "@/hooks/use-theme";
import { useT } from "@/lib/i18n";
import { formatModelLabel, formatSlug } from "@/utils/formatters";

const MODEL_OPTION_DELIMITER = ":::";

export function DashboardPage() {
  const navigate = useNavigate();
  const t = useT();
  const isDark = useThemeStore((s) => s.theme === "dark");
  const [accountSort, setAccountSort] = useState<DashboardSortState>({ field: "email", direction: "asc" });
  const dashboardQuery = useDashboard();
  const { filters, logsQuery, optionsQuery, updateFilters } = useRequestLogs();
  const { resumeMutation } = useAccountMutations();

  const handleAccountAction = useCallback(
    (account: AccountSummary, action: string) => {
      switch (action) {
        case "details":
          navigate(`/accounts?selected=${account.accountId}`);
          break;
        case "resume":
          void resumeMutation.mutateAsync(account.accountId);
          break;
        case "reauth":
          navigate(`/accounts?selected=${account.accountId}`);
          break;
      }
    },
    [navigate, resumeMutation],
  );

  const overview = dashboardQuery.data;
  const logPage = logsQuery.data;

  const view = useMemo(() => {
    if (!overview || !logPage) {
      return null;
    }
    return buildDashboardView(overview, logPage.requests, isDark);
  }, [overview, logPage, isDark]);

  const accountOptions = useMemo(() => {
    const entries = new Map<string, { label: string; isEmail: boolean }>();
    for (const account of overview?.accounts ?? []) {
      const raw = account.displayName || account.email || account.accountId;
      const isEmail = !!account.email && raw === account.email;
      entries.set(account.accountId, { label: raw, isEmail });
    }
    return (optionsQuery.data?.accountIds ?? []).map((accountId) => {
      const entry = entries.get(accountId);
      return {
        value: accountId,
        label: entry?.label ?? accountId,
        isEmail: entry?.isEmail ?? false,
      };
    });
  }, [optionsQuery.data?.accountIds, overview?.accounts]);

  const modelOptions = useMemo(
    () =>
      (optionsQuery.data?.modelOptions ?? []).map((option) => ({
        value: `${option.model}${MODEL_OPTION_DELIMITER}${option.reasoningEffort ?? ""}`,
        label: formatModelLabel(option.model, option.reasoningEffort),
      })),
    [optionsQuery.data?.modelOptions],
  );

  const statusOptions = useMemo(
    () =>
      (optionsQuery.data?.statuses ?? []).map((status) => ({
        value: status,
        label:
          ({
            ok: t("requestStatusOk"),
            rate_limit: t("requestStatusRateLimit"),
            quota: t("requestStatusQuota"),
            error: t("requestStatusError"),
          }[status] ?? formatSlug(status)),
      })),
    [optionsQuery.data?.statuses, t],
  );

  const errorMessage =
    (dashboardQuery.error instanceof Error && dashboardQuery.error.message) ||
    (logsQuery.error instanceof Error && logsQuery.error.message) ||
    (optionsQuery.error instanceof Error && optionsQuery.error.message) ||
    null;
  const sortedAccounts = useMemo(
    () => sortDashboardAccounts(overview?.accounts ?? [], accountSort),
    [overview?.accounts, accountSort],
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      {errorMessage ? <AlertMessage variant="error">{errorMessage}</AlertMessage> : null}

      {!view ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatsGrid stats={view.stats} />

            <UsageDonuts
              accounts={overview?.accounts ?? []}
              primaryItems={view.primaryUsageItems}
              secondaryItems={view.secondaryUsageItems}
              primaryTotal={overview?.summary.primaryWindow.capacityCredits ?? 0}
              secondaryTotal={overview?.summary.secondaryWindow?.capacityCredits ?? 0}
              safeLinePrimary={view.safeLinePrimary}
              safeLineSecondary={view.safeLineSecondary}
            />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">{t("dashboardAccounts")}</h2>
              <div className="h-px flex-1 bg-border" />
              <AccountSortControls
                sort={accountSort}
                onChange={setAccountSort}
                options={["email", "workspace", "primary_remaining", "primary_reset", "secondary_remaining", "secondary_reset"]}
                appearance="bare"
                badgePlacement="end"
                className="gap-3"
                buttonClassName="h-8 w-[2.25rem] px-0"
              />
            </div>
            <AccountCards accounts={sortedAccounts} onAction={handleAccountAction} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">{t("dashboardRequestLogs")}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <RequestFilters
              filters={filters}
              accountOptions={accountOptions}
              modelOptions={modelOptions}
              statusOptions={statusOptions}
              onSearchChange={(search) => updateFilters({ search, offset: 0 })}
              onTimeframeChange={(timeframe) => updateFilters({ timeframe, offset: 0 })}
              onAccountChange={(accountIds) => updateFilters({ accountIds, offset: 0 })}
              onModelChange={(modelOptionsSelected) =>
                updateFilters({ modelOptions: modelOptionsSelected, offset: 0 })
              }
              onStatusChange={(statuses) => updateFilters({ statuses, offset: 0 })}
              onReset={() =>
                updateFilters({
                  search: "",
                  timeframe: "all",
                  accountIds: [],
                  modelOptions: [],
                  statuses: [],
                  offset: 0,
                })
              }
            />
            <div className="transition-opacity duration-200">
              <RecentRequestsTable
                requests={view.requestLogs}
                accounts={overview?.accounts ?? []}
                total={logPage?.total ?? 0}
                limit={filters.limit}
                offset={filters.offset}
                hasMore={logPage?.hasMore ?? false}
                onLimitChange={(limit) => updateFilters({ limit, offset: 0 })}
                onOffsetChange={(offset) => updateFilters({ offset })}
              />
            </div>
          </section>
        </>
      )}

    </div>
  );
}

import {
  CircleAlert,
  CircleCheckBig,
  CircleHelp,
  CircleOff,
  Check,
  Funnel,
  PauseCircle,
  Plus,
  Search,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AccountListItem } from "@/features/accounts/components/account-list-item";
import { AccountSortControls } from "@/features/dashboard/components/account-sort-controls";
import type { DashboardSortState } from "@/features/dashboard/components/account-sort";
import {
  sortAccounts,
  type SortOption,
} from "@/features/accounts/components/account-list-sorting";
import { WindowsOauthHelp } from "@/features/accounts/components/windows-oauth-help";
import type { AccountSummary } from "@/features/accounts/schemas";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { buildDuplicateAccountIdSet } from "@/utils/account-identifiers";

export type AccountListProps = {
  accounts: AccountSummary[];
  selectedAccountId: string | null;
  onSelect: (accountId: string) => void;
  onOpenImport: () => void;
  onOpenOauth: () => void;
};

export function AccountList({
  accounts,
  selectedAccountId,
  onSelect,
  onOpenImport,
  onOpenOauth,
}: AccountListProps) {
  const t = useT();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>({ field: "email", direction: "asc" } satisfies DashboardSortState);
  const [helpOpen, setHelpOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filteredAccounts = accounts.filter((account) => {
      if (statusFilter !== "all" && account.status !== statusFilter) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        account.email.toLowerCase().includes(needle) ||
        account.accountId.toLowerCase().includes(needle) ||
        account.planType.toLowerCase().includes(needle) ||
        (account.workspaceId?.toLowerCase().includes(needle) ?? false) ||
        (account.workspaceName?.toLowerCase().includes(needle) ?? false)
      );
    });

    return sortAccounts(filteredAccounts, sortBy);
  }, [accounts, search, sortBy, statusFilter]);

  const duplicateAccountIds = useMemo(() => buildDuplicateAccountIdSet(accounts), [accounts]);
  const statusOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("commonAllStatuses"),
        icon: Funnel,
        iconClassName: "text-muted-foreground",
      },
      {
        value: "active",
        label: t("statusActive"),
        icon: CircleCheckBig,
        iconClassName: "text-emerald-500",
      },
      {
        value: "paused",
        label: t("statusPaused"),
        icon: PauseCircle,
        iconClassName: "text-amber-500",
      },
      {
        value: "rate_limited",
        label: t("statusLimited"),
        icon: CircleAlert,
        iconClassName: "text-orange-500",
      },
      {
        value: "quota_exceeded",
        label: t("statusExceeded"),
        icon: TriangleAlert,
        iconClassName: "text-red-500",
      },
      {
        value: "deactivated",
        label: t("statusDeactivated"),
        icon: CircleOff,
        iconClassName: "text-zinc-500",
      },
    ],
    [t],
  );
  const selectedStatusOption =
    statusOptions.find((option) => option.value === statusFilter) ?? statusOptions[0];
  const SelectedStatusIcon = selectedStatusOption.icon;

  return (
      <div className="space-y-3">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" aria-hidden />
            <Input
              placeholder={t("accountListSearchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={selectedStatusOption.label}
              >
                <SelectedStatusIcon className={cn("h-4 w-4", selectedStatusOption.iconClassName)} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const active = option.value === statusFilter;
                return (
                  <DropdownMenuItem key={option.value} onClick={() => setStatusFilter(option.value)}>
                    <Icon className={cn("h-4 w-4", option.iconClassName)} />
                    <span className="flex-1">{option.label}</span>
                    {active ? <Check className="h-4 w-4 text-muted-foreground" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onOpenImport} className="h-9 flex-1 gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" />
            {t("commonImport")}
          </Button>
          <Button type="button" size="sm" onClick={onOpenOauth} className="h-9 flex-1 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            {t("accountListAddAccount")}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={cn(
              "h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground",
              helpOpen ? "bg-muted" : "",
            )}
            onClick={() => setHelpOpen((current) => !current)}
            aria-label={t("accountListNeedHelp")}
          >
            <CircleHelp className="h-4 w-4" />
          </Button>
        </div>

        {helpOpen ? <WindowsOauthHelp /> : null}

        <div className="flex w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 pt-1">
          <AccountSortControls
            sort={sortBy}
            onChange={setSortBy}
            options={["email", "workspace", "primary_remaining", "primary_reset", "secondary_remaining", "secondary_reset"]}
            appearance="bare"
            badgePlacement="end"
            compact
            className="justify-end"
            buttonClassName="h-9 w-9 px-0"
          />
        </div>

        <div className="max-h-[calc(100vh-16rem)] space-y-1 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">{t("accountListNoMatches")}</p>
              <p className="text-xs text-muted-foreground/70">{t("accountListAdjustFilters")}</p>
            </div>
          ) : (
            filtered.map((account) => (
              <AccountListItem
                key={account.accountId}
                account={account}
                selected={account.accountId === selectedAccountId}
                showAccountId={duplicateAccountIds.has(account.accountId)}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
  );
}

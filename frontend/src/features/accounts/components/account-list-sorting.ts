import type { AccountSummary } from "@/features/accounts/schemas";
import {
  sortDashboardAccounts,
  type DashboardSortState,
} from "@/features/dashboard/components/account-sort";

export type SortOption = DashboardSortState;

export function sortAccounts(accounts: AccountSummary[], sortBy: SortOption): AccountSummary[] {
  return sortDashboardAccounts(accounts, sortBy);
}

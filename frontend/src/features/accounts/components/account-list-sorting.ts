import type { AccountSummary } from "@/features/accounts/schemas";

export type SortOption = "email_asc" | "workspace_asc" | "remaining_desc" | "remaining_asc";

export function sortAccounts(accounts: AccountSummary[], sortBy: SortOption): AccountSummary[] {
  return accounts
    .slice()
    .sort((left: AccountSummary, right: AccountSummary) => compareAccounts(left, right, sortBy));
}

function compareAccounts(left: AccountSummary, right: AccountSummary, sortBy: SortOption): number {
  if (sortBy === "workspace_asc") {
    const workspaceCompare = compareText(
      left.workspaceName || left.workspaceId || "",
      right.workspaceName || right.workspaceId || "",
    );
    if (workspaceCompare !== 0) {
      return workspaceCompare;
    }
    return compareText(left.email, right.email);
  }

  if (sortBy === "remaining_desc" || sortBy === "remaining_asc") {
    const direction = sortBy === "remaining_desc" ? -1 : 1;
    const remainingCompare = compareNumber(
      left.usage?.secondaryRemainingPercent ?? left.usage?.primaryRemainingPercent ?? -1,
      right.usage?.secondaryRemainingPercent ?? right.usage?.primaryRemainingPercent ?? -1,
    );
    if (remainingCompare !== 0) {
      return remainingCompare * direction;
    }
    return compareText(left.email, right.email);
  }

  return compareText(left.email, right.email);
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base", numeric: true });
}

function compareNumber(left: number, right: number): number {
  return left - right;
}

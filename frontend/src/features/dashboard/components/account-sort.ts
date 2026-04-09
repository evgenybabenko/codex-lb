import type { AccountSummary } from "@/features/dashboard/schemas";

export type DashboardSortField =
  | "email"
  | "workspace"
  | "primary_remaining"
  | "secondary_remaining"
  | "primary_reset"
  | "secondary_reset";

export type DashboardSortDirection = "asc" | "desc";

export type DashboardSortState = {
  field: DashboardSortField;
  direction: DashboardSortDirection;
};

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base", numeric: true });
}

function compareNumber(left: number, right: number): number {
  return left - right;
}

function parseResetTimestamp(value: string | null | undefined): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function defaultDirectionForField(field: DashboardSortField): DashboardSortDirection {
  if (field === "primary_reset" || field === "secondary_reset" || field === "email" || field === "workspace") {
    return "asc";
  }
  return "desc";
}

export function toggleSortState(current: DashboardSortState, field: DashboardSortField): DashboardSortState {
  if (current.field === field) {
    return { field, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { field, direction: defaultDirectionForField(field) };
}

export function sortDashboardAccounts(accounts: AccountSummary[], sort: DashboardSortState): AccountSummary[] {
  const direction = sort.direction === "asc" ? 1 : -1;

  return accounts.slice().sort((left, right) => {
    const compare = (() => {
      switch (sort.field) {
        case "workspace":
          return compareText(left.workspaceName || left.workspaceId || "", right.workspaceName || right.workspaceId || "");
        case "primary_remaining":
          return compareNumber(left.usage?.primaryRemainingPercent ?? -1, right.usage?.primaryRemainingPercent ?? -1);
        case "secondary_remaining":
          return compareNumber(left.usage?.secondaryRemainingPercent ?? -1, right.usage?.secondaryRemainingPercent ?? -1);
        case "primary_reset":
          return compareNumber(parseResetTimestamp(left.resetAtPrimary), parseResetTimestamp(right.resetAtPrimary));
        case "secondary_reset":
          return compareNumber(parseResetTimestamp(left.resetAtSecondary), parseResetTimestamp(right.resetAtSecondary));
        case "email":
        default:
          return compareText(left.email, right.email);
      }
    })();

    if (compare !== 0) {
      return compare * direction;
    }

    return compareText(left.email, right.email);
  });
}

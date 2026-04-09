import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountList } from "@/features/accounts/components/account-list";
import { sortAccounts } from "@/features/accounts/components/account-list-sorting";

describe("AccountList", () => {
  it("renders items and filters by search", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AccountList
        accounts={[
          {
            accountId: "acc-1",
            email: "primary@example.com",
            displayName: "Primary",
            planType: "plus",
            status: "active",
            additionalQuotas: [],
          },
          {
            accountId: "acc-2",
            email: "secondary@example.com",
            displayName: "Secondary",
            planType: "pro",
            status: "paused",
            additionalQuotas: [],
          },
        ]}
        selectedAccountId="acc-1"
        onSelect={onSelect}
        onOpenImport={() => {}}
        onOpenOauth={() => {}}
      />,
    );

    expect(screen.getByText("primary@example.com")).toBeInTheDocument();
    expect(screen.getByText("secondary@example.com")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search accounts..."), "secondary");
    expect(screen.queryByText("primary@example.com")).not.toBeInTheDocument();
    expect(screen.getByText("secondary@example.com")).toBeInTheDocument();

    await user.click(screen.getByText("secondary@example.com"));
    expect(onSelect).toHaveBeenCalledWith("acc-2");
  });

  it("shows empty state when no items match filter", async () => {
    const user = userEvent.setup();

    render(
      <AccountList
        accounts={[
          {
            accountId: "acc-1",
            email: "primary@example.com",
            displayName: "Primary",
            planType: "plus",
            status: "active",
            additionalQuotas: [],
          },
        ]}
        selectedAccountId={null}
        onSelect={() => {}}
        onOpenImport={() => {}}
        onOpenOauth={() => {}}
      />,
    );

    await user.type(screen.getByPlaceholderText("Search accounts..."), "not-found");
    expect(screen.getByText("No matching accounts")).toBeInTheDocument();
  });

  it("shows account id only for duplicate emails", () => {
    render(
      <AccountList
        accounts={[
          {
            accountId: "d48f0bfc-8ea6-48a7-8d76-d0e5ef1816c5_6f12b5d5",
            email: "dup@example.com",
            displayName: "Duplicate A",
            planType: "plus",
            status: "active",
            additionalQuotas: [],
          },
          {
            accountId: "7f9de2ad-7621-4a6f-88bc-ec7f3d914701_91a95cee",
            email: "dup@example.com",
            displayName: "Duplicate B",
            planType: "plus",
            status: "active",
            additionalQuotas: [],
          },
          {
            accountId: "acc-3",
            email: "unique@example.com",
            displayName: "Unique",
            planType: "pro",
            status: "active",
            additionalQuotas: [],
          },
        ]}
        selectedAccountId={null}
        onSelect={() => {}}
        onOpenImport={() => {}}
        onOpenOauth={() => {}}
      />,
    );

    const duplicateButtons = screen
      .getAllByRole("button")
      .filter((element) => element.textContent?.includes("dup@example.com"));
    expect(duplicateButtons[0]?.textContent).not.toContain(" | ID ");
    expect(duplicateButtons[1]?.textContent).not.toContain(" | ID ");
    expect(screen.getByText("unique@example.com")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button")
        .filter((element) => element.textContent?.includes("unique@example.com"))[0]?.textContent,
    ).not.toContain(" | ID ");
  });

  it("sorts accounts by workspace and remaining quota", async () => {
    const accounts = [
      {
        accountId: "acc-1",
        email: "charlie@example.com",
        displayName: "Charlie",
        workspaceName: "Zulu",
        planType: "team",
        status: "active",
        usage: { primaryRemainingPercent: 30, secondaryRemainingPercent: 45 },
        additionalQuotas: [],
      },
      {
        accountId: "acc-2",
        email: "alpha@example.com",
        displayName: "Alpha",
        workspaceName: "Alpha",
        planType: "team",
        status: "active",
        usage: { primaryRemainingPercent: 60, secondaryRemainingPercent: 70 },
        additionalQuotas: [],
      },
      {
        accountId: "acc-3",
        email: "bravo@example.com",
        displayName: "Bravo",
        workspaceName: "Bravo",
        planType: "team",
        status: "active",
        usage: { primaryRemainingPercent: 10, secondaryRemainingPercent: 20 },
        additionalQuotas: [],
      },
    ];

    expect(sortAccounts(accounts, { field: "email", direction: "asc" }).map((account) => account.email)).toEqual([
      "alpha@example.com",
      "bravo@example.com",
      "charlie@example.com",
    ]);

    expect(sortAccounts(accounts, { field: "workspace", direction: "asc" }).map((account) => account.email)).toEqual([
      "alpha@example.com",
      "bravo@example.com",
      "charlie@example.com",
    ]);

    expect(sortAccounts(accounts, { field: "secondary_remaining", direction: "asc" }).map((account) => account.email)).toEqual([
      "bravo@example.com",
      "charlie@example.com",
      "alpha@example.com",
    ]);
  });
});

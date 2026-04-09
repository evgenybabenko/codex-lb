import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { UsageDonuts } from "@/features/dashboard/components/usage-donuts";
import { createAccountSummary } from "@/test/mocks/factories";

/** Helper to build a minimal RemainingItem for tests. */
function item(overrides: { accountId: string; label: string; value: number; remainingPercent: number; color: string }) {
  return { ...overrides, capacityValue: 200, workspaceLabel: "Alpha", resetLabel: "4h", isEmail: true };
}

describe("UsageDonuts", () => {
  function hasExactText(value: string) {
    return (_content: string, node: Element | null) => node?.textContent === value;
  }

  it("renders one shared card with both donut summaries and table rows", () => {
    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({ accountId: "acc-1", email: "primary@example.com" }),
          createAccountSummary({ accountId: "acc-2", email: "secondary@example.com" }),
        ]}
        primaryItems={[item({ accountId: "acc-1", label: "primary@example.com", value: 120, remainingPercent: 60, color: "#7bb661" })]}
        secondaryItems={[item({ accountId: "acc-2", label: "secondary@example.com", value: 80, remainingPercent: 40, color: "#d9a441" })]}
        primaryTotal={200}
        secondaryTotal={200}
      />,
    );

    expect(screen.getByText("5H")).toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Remaining" })).toBeInTheDocument();
    expect(screen.getByText("primary@example.com")).toBeInTheDocument();
    expect(screen.getByText("secondary@example.com")).toBeInTheDocument();
  });

  it("renders aggregate remaining totals in the donut centers", () => {
    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({ accountId: "acc-1", email: "p1@example.com" }),
          createAccountSummary({ accountId: "acc-2", email: "p2@example.com" }),
          createAccountSummary({ accountId: "acc-3", email: "s1@example.com" }),
          createAccountSummary({ accountId: "acc-4", email: "s2@example.com" }),
        ]}
        primaryItems={[
          item({ accountId: "acc-1", label: "p1@example.com", value: 120, remainingPercent: 60, color: "#7bb661" }),
          item({ accountId: "acc-2", label: "p2@example.com", value: 30, remainingPercent: 15, color: "#3b82f6" }),
        ]}
        secondaryItems={[
          item({ accountId: "acc-3", label: "s1@example.com", value: 80, remainingPercent: 40, color: "#d9a441" }),
          item({ accountId: "acc-4", label: "s2@example.com", value: 10, remainingPercent: 5, color: "#8b5cf6" }),
        ]}
        primaryTotal={200}
        secondaryTotal={200}
      />,
    );

    expect(screen.getAllByText(hasExactText("150/200")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(hasExactText("90/200")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("120/200").length).toBeGreaterThanOrEqual(1);
  });

  it("handles empty data gracefully", () => {
    render(
      <UsageDonuts
        accounts={[]}
        primaryItems={[]}
        secondaryItems={[]}
        primaryTotal={0}
        secondaryTotal={0}
      />,
    );

    expect(screen.getByText("5H")).toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Remaining" })).toBeInTheDocument();
  });

  it("renders safe line only for the primary donut", () => {
    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({ accountId: "acc-1", email: "primary@example.com" }),
          createAccountSummary({ accountId: "acc-2", email: "secondary@example.com" }),
        ]}
        primaryItems={[item({ accountId: "acc-1", label: "primary@example.com", value: 120, remainingPercent: 60, color: "#7bb661" })]}
        secondaryItems={[item({ accountId: "acc-2", label: "secondary@example.com", value: 80, remainingPercent: 40, color: "#d9a441" })]}
        primaryTotal={200}
        secondaryTotal={200}
        safeLinePrimary={{ safePercent: 60, riskLevel: "warning" }}
      />,
    );

    expect(screen.getAllByTestId("safe-line-tick")).toHaveLength(1);
  });

  it("renders safe line for safe depletion states", () => {
    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({ accountId: "acc-1", email: "primary@example.com" }),
          createAccountSummary({ accountId: "acc-2", email: "secondary@example.com" }),
        ]}
        primaryItems={[item({ accountId: "acc-1", label: "primary@example.com", value: 120, remainingPercent: 60, color: "#7bb661" })]}
        secondaryItems={[item({ accountId: "acc-2", label: "secondary@example.com", value: 80, remainingPercent: 40, color: "#d9a441" })]}
        primaryTotal={200}
        secondaryTotal={200}
        safeLinePrimary={{ safePercent: 60, riskLevel: "safe" }}
      />,
    );

    expect(screen.getAllByTestId("safe-line-tick")).toHaveLength(1);
  });

  it("renders safe line on both donuts when both have depletion", () => {
    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({ accountId: "acc-1", email: "primary@example.com" }),
          createAccountSummary({ accountId: "acc-2", email: "secondary@example.com" }),
        ]}
        primaryItems={[item({ accountId: "acc-1", label: "primary@example.com", value: 120, remainingPercent: 60, color: "#7bb661" })]}
        secondaryItems={[item({ accountId: "acc-2", label: "secondary@example.com", value: 80, remainingPercent: 40, color: "#d9a441" })]}
        primaryTotal={200}
        secondaryTotal={200}
        safeLinePrimary={{ safePercent: 60, riskLevel: "warning" }}
        safeLineSecondary={{ safePercent: 40, riskLevel: "danger" }}
      />,
    );

    expect(screen.getAllByTestId("safe-line-tick")).toHaveLength(2);
  });

  it("renders safe line only on secondary donut for weekly-only plans", () => {
    render(
      <UsageDonuts
        accounts={[createAccountSummary({ accountId: "acc-1", email: "weekly@example.com" })]}
        primaryItems={[]}
        secondaryItems={[item({ accountId: "acc-1", label: "weekly@example.com", value: 80, remainingPercent: 40, color: "#d9a441" })]}
        primaryTotal={0}
        secondaryTotal={200}
        safeLineSecondary={{ safePercent: 60, riskLevel: "warning" }}
      />,
    );

    expect(screen.getAllByTestId("safe-line-tick")).toHaveLength(1);
  });

  it("sorts combined table rows from the shared headers", async () => {
    const user = userEvent.setup();

    render(
      <UsageDonuts
        accounts={[
          createAccountSummary({
            accountId: "acc-1",
            email: "zeta@example.com",
            workspaceName: "Zeta",
            usage: { primaryRemainingPercent: 15, secondaryRemainingPercent: 70 },
            resetAtPrimary: "2026-01-02T00:00:00.000Z",
            resetAtSecondary: "2026-01-03T00:00:00.000Z",
          }),
          createAccountSummary({
            accountId: "acc-2",
            email: "alpha@example.com",
            workspaceName: "Alpha",
            usage: { primaryRemainingPercent: 85, secondaryRemainingPercent: 20 },
            resetAtPrimary: "2026-01-01T00:00:00.000Z",
            resetAtSecondary: "2026-01-02T00:00:00.000Z",
          }),
        ]}
        primaryItems={[
          item({ accountId: "acc-1", label: "zeta@example.com", value: 15, remainingPercent: 15, color: "#7bb661" }),
          item({ accountId: "acc-2", label: "alpha@example.com", value: 85, remainingPercent: 85, color: "#3b82f6" }),
        ]}
        secondaryItems={[
          item({ accountId: "acc-1", label: "zeta@example.com", value: 70, remainingPercent: 70, color: "#d9a441" }),
          item({ accountId: "acc-2", label: "alpha@example.com", value: 20, remainingPercent: 20, color: "#8b5cf6" }),
        ]}
        primaryTotal={200}
        secondaryTotal={200}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Sort by 5h remaining/i }));
    const firstAlpha = screen.getAllByText("alpha@example.com")[0]!;
    const firstZeta = screen.getAllByText("zeta@example.com")[0]!;
    expect(firstAlpha.compareDocumentPosition(firstZeta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /Sort by 5h remaining/i }));
    const toggledAlpha = screen.getAllByText("alpha@example.com")[0]!;
    const toggledZeta = screen.getAllByText("zeta@example.com")[0]!;
    expect(toggledZeta.compareDocumentPosition(toggledAlpha) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

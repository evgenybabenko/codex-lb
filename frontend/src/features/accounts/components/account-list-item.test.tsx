import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountListItem } from "@/features/accounts/components/account-list-item";
import { createAccountSummary } from "@/test/mocks/factories";

describe("AccountListItem", () => {
  it("renders neutral quota track when secondary remaining percent is unknown", () => {
    const account = createAccountSummary({
      usage: {
        primaryRemainingPercent: 82,
        secondaryRemainingPercent: null,
      },
    });

    render(<AccountListItem account={account} selected={false} onSelect={vi.fn()} />);

    expect(screen.getByTestId("mini-quota-secondary-track")).toHaveClass("bg-muted");
    expect(screen.queryByTestId("mini-quota-secondary-fill")).not.toBeInTheDocument();
  });

  it("renders both 5h and 7d quota fills when remaining percents are available", () => {
    const account = createAccountSummary({
      usage: {
        primaryRemainingPercent: 82,
        secondaryRemainingPercent: 73,
      },
    });

    render(<AccountListItem account={account} selected={false} onSelect={vi.fn()} />);

    expect(screen.getByTestId("mini-quota-primary-fill")).toHaveStyle({ width: "82%" });
    expect(screen.getByTestId("mini-quota-secondary-fill")).toHaveStyle({ width: "73%" });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AccountCards } from "@/features/dashboard/components/account-cards";
import { createAccountSummary } from "@/test/mocks/factories";

describe("AccountCards", () => {
  it("toggles sort direction when clicking the same sort control twice", async () => {
    const user = userEvent.setup();

    render(
      <AccountCards
        accounts={[
          createAccountSummary({
            accountId: "acc-z",
            email: "zeta@example.com",
            workspaceName: "Zeta",
            usage: { primaryRemainingPercent: 15, secondaryRemainingPercent: 70 },
          }),
          createAccountSummary({
            accountId: "acc-a",
            email: "alpha@example.com",
            workspaceName: "Alpha",
            usage: { primaryRemainingPercent: 85, secondaryRemainingPercent: 20 },
          }),
        ]}
      />,
    );

    expect(screen.getAllByText(/@example\.com/)[0]).toHaveTextContent("alpha@example.com");

    await user.click(screen.getByRole("button", { name: /Sort by 5h remaining/ }));
    expect(screen.getAllByText(/@example\.com/)[0]).toHaveTextContent("alpha@example.com");

    await user.click(screen.getByRole("button", { name: /Sort by 5h remaining/ }));
    expect(screen.getAllByText(/@example\.com/)[0]).toHaveTextContent("zeta@example.com");
  });
});

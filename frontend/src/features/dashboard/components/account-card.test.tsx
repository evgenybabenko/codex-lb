import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccountCard } from "@/features/dashboard/components/account-card";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { createAccountSummary } from "@/test/mocks/factories";

afterEach(() => {
  act(() => {
    usePrivacyStore.setState({ blurred: false });
  });
});

describe("AccountCard", () => {
  it("renders both 5h and weekly quota bars for regular accounts", () => {
    const account = createAccountSummary({
      workspaceName: "Ve3ultra",
      auth: {
        access: { expiresAt: "2026-01-01T12:30:00.000Z", state: null },
        refresh: { state: "stored" },
        idToken: { state: "parsed" },
        subscriptionActiveUntil: "2026-04-17T10:48:54.000Z",
      },
    });
    render(<AccountCard account={account} />);

    expect(screen.getByText("Workspace | Ve3ultra | until 2026-04-17")).toBeInTheDocument();
    expect(screen.getByText("5h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("hides 5h quota bar for weekly-only accounts", () => {
    const account = createAccountSummary({
      planType: "free",
      workspaceId: "personal-free",
      usage: {
        primaryRemainingPercent: null,
        secondaryRemainingPercent: 76,
      },
      windowMinutesPrimary: null,
      windowMinutesSecondary: 10_080,
    });

    render(<AccountCard account={account} />);

    expect(screen.getByText("Personal | Free")).toBeInTheDocument();
    expect(screen.queryByText("5h")).not.toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("omits subscription suffix when subscription date is missing", () => {
    const account = createAccountSummary({ workspaceName: "Xstores", auth: null });

    render(<AccountCard account={account} />);

    expect(screen.getByText("Workspace | Xstores")).toBeInTheDocument();
  });

  it("blurs the dashboard card title when privacy mode is enabled", () => {
    act(() => {
      usePrivacyStore.setState({ blurred: true });
    });
    const account = createAccountSummary({
      displayName: "AWS Account MSP",
      email: "aws-account@example.com",
    });

    const { container } = render(<AccountCard account={account} />);

    expect(screen.getByText("aws-account@example.com")).toBeInTheDocument();
    expect(container.querySelector(".privacy-blur")).not.toBeNull();
  });
});

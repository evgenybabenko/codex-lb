import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountCard } from "@/features/dashboard/components/account-card";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { createAccountSummary } from "@/test/mocks/factories";

afterEach(() => {
  act(() => {
    usePrivacyStore.setState({ blurred: false });
  });
});

describe("AccountCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders both 5H and 7D quota bars for regular accounts", () => {
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
    expect(screen.getByText("5H")).toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getAllByText(/13h|1d 12h/).length).toBeGreaterThan(0);
  });

  it("hides 5H quota bar for weekly-only accounts", () => {
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
    expect(screen.queryByText("5H")).not.toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
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

  it("navigates through the whole card click instead of a separate link icon", async () => {
    const onAction = vi.fn();
    const account = createAccountSummary();

    render(<AccountCard account={account} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onAction).toHaveBeenCalledWith(account, "details");
  });
});

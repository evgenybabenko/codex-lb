import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecentRequestsTable } from "@/features/dashboard/components/recent-requests-table";

const ISO = "2026-01-01T12:00:00+00:00";

const PAGINATION_PROPS = {
  total: 1,
  limit: 25,
  offset: 0,
  hasMore: false,
  onLimitChange: vi.fn(),
  onOffsetChange: vi.fn(),
};

describe("RecentRequestsTable", () => {
  it("renders rows with status badges and supports error expansion", async () => {
    const user = userEvent.setup();
    const longError = "Rate limit reached while processing this request ".repeat(3);

    render(
      <RecentRequestsTable
        {...PAGINATION_PROPS}
         accounts={[
           {
             accountId: "acc-primary",
             email: "primary@example.com",
             displayName: "Primary Account",
             planType: "plus",
             status: "active",
             additionalQuotas: [],
           },
         ]}
        requests={[
          {
            requestedAt: ISO,
            accountId: "acc-primary",
            apiKeyName: "Key Alpha",
            requestId: "req-1",
            model: "gpt-5.1",
            serviceTier: "default",
            requestedServiceTier: "priority",
            actualServiceTier: "default",
            transport: "websocket",
            status: "rate_limit",
            errorCode: "rate_limit_exceeded",
            errorMessage: longError,
            tokens: 1200,
            cachedInputTokens: 200,
            reasoningEffort: "high",
            costUsd: 0.01,
            latencyMs: 1000,
            latencyFirstTokenMs: 240,
          },
        ]}
      />,
    );

    expect(screen.getByText("Primary Account")).toBeInTheDocument();
    expect(screen.getByText("Key Alpha")).toBeInTheDocument();
    expect(screen.getByText("gpt-5.1 (high, default)")).toBeInTheDocument();
    expect(screen.getByText("Requested priority")).toBeInTheDocument();
    expect(screen.getByText("WS")).toBeInTheDocument();
    expect(screen.getByText("Rate limit")).toBeInTheDocument();

    const viewButton = screen.getByRole("button", { name: "View" });
    await user.click(viewButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Error Detail")).toBeInTheDocument();
    expect(dialog.textContent).toContain("Rate limit reached while processing this request");
  });

  it("collapses inline errors while preserving request diagnostics", async () => {
    const user = userEvent.setup();

    render(
      <RecentRequestsTable
        {...PAGINATION_PROPS}
        accounts={[]}
        requests={[
          {
            requestedAt: ISO,
            accountId: "acc-primary",
            apiKeyName: "Key Alpha",
            requestId: "req-compact",
            model: "gpt-5.1",
            serviceTier: "default",
            requestedServiceTier: null,
            actualServiceTier: null,
            transport: "http",
            status: "rate_limit",
            errorCode: "rate_limit_exceeded",
            errorMessage: "Try again later",
            tokens: 42,
            cachedInputTokens: null,
            reasoningEffort: null,
            costUsd: 0,
            latencyMs: 980,
            latencyFirstTokenMs: 180,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("switch", { name: "Show inline error details" }));

    expect(screen.getByText("Inline details off")).toBeInTheDocument();
    expect(screen.queryByText("Try again later")).not.toBeInTheDocument();
    expect(screen.getByText("rate_limit_exceeded")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Request req-compact");
    expect(dialog.textContent).toContain("gpt-5.1");
    expect(dialog.textContent).toContain("980 ms");
    expect(dialog.textContent).toContain("180 ms");
    expect(dialog.textContent).toContain("Try again later");
  });

  it("renders empty state and keeps request-log visibility controls visible", () => {
    render(<RecentRequestsTable {...PAGINATION_PROPS} total={0} accounts={[]} requests={[]} />);
    expect(screen.getByText("Request log visibility")).toBeInTheDocument();
    expect(screen.getByText("No request logs match the current filters.")).toBeInTheDocument();
  });

  it("renders placeholder transport for legacy rows", () => {
    render(
      <RecentRequestsTable
        {...PAGINATION_PROPS}
        accounts={[]}
        requests={[
          {
            requestedAt: ISO,
            accountId: "acc-legacy",
            apiKeyName: null,
            requestId: "req-legacy",
            model: "gpt-5.1",
            serviceTier: null,
            requestedServiceTier: null,
            actualServiceTier: null,
            transport: null,
            status: "ok",
            errorCode: null,
            errorMessage: null,
            tokens: 1,
            cachedInputTokens: null,
            reasoningEffort: null,
            costUsd: 0,
            latencyMs: 1,
            latencyFirstTokenMs: null,
          },
        ]}
      />,
    );

    expect(screen.getAllByText("--")[0]).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RoutingSettings } from "@/features/settings/components/routing-settings";
import type { DashboardSettings } from "@/features/settings/schemas";

const BASE_SETTINGS: DashboardSettings = {
  stickyThreadsEnabled: false,
  upstreamStreamTransport: "default",
  weeklyResetPreference: "earlier_reset",
  prioritizeFullWeeklyCapacity: true,
  routingStrategy: "usage_weighted",
  openaiCacheAffinityMaxAgeSeconds: 300,
  spreadNewCodexSessions: false,
  spreadNewCodexSessionsWindowSeconds: 60,
  spreadNewCodexSessionsTopPoolSize: 5,
  importWithoutOverwrite: false,
  totpRequiredOnLogin: false,
  totpConfigured: false,
  apiKeyAuthEnabled: true,
};

function renderRoutingSettings(
  settings: DashboardSettings,
  onSave = vi.fn().mockResolvedValue(undefined),
) {
  return {
    onSave,
    ...render(
      <TooltipProvider>
        <RoutingSettings settings={settings} busy={false} onSave={onSave} />
      </TooltipProvider>,
    ),
  };
}

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => undefined;
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => undefined;
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined;
  }
});

function getRoutingNumberInputs() {
  return screen.getAllByRole("spinbutton") as HTMLInputElement[];
}

describe("RoutingSettings", () => {
  it("saves a new prompt-cache affinity ttl from the button and Enter key", async () => {
    const user = userEvent.setup();
    const { onSave, rerender } = renderRoutingSettings(BASE_SETTINGS);

    const ttlInput = getRoutingNumberInputs()[2]!;
    await user.clear(ttlInput);
    await user.type(ttlInput, "180");
    await user.click(screen.getByRole("button", { name: "Save TTL" }));

    expect(onSave).toHaveBeenCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 180,
      spreadNewCodexSessions: false,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });

    rerender(
      <TooltipProvider>
        <RoutingSettings
          settings={{ ...BASE_SETTINGS, openaiCacheAffinityMaxAgeSeconds: 180 }}
          busy={false}
          onSave={onSave}
        />
      </TooltipProvider>,
    );

    const updatedTtlInput = getRoutingNumberInputs()[2]!;
    await user.clear(updatedTtlInput);
    await user.type(updatedTtlInput, "240{Enter}");

    expect(onSave).toHaveBeenLastCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 240,
      spreadNewCodexSessions: false,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });
  });

  it("disables ttl save for invalid values and saves sticky-thread toggles", async () => {
    const user = userEvent.setup();
    const { onSave } = renderRoutingSettings(BASE_SETTINGS);

    const ttlInput = getRoutingNumberInputs()[2]!;
    const saveButton = screen.getByRole("button", { name: "Save TTL" });
    expect(saveButton).toBeDisabled();

    await user.clear(ttlInput);
    await user.type(ttlInput, "0");
    expect(saveButton).toBeDisabled();

    await user.click(screen.getAllByRole("switch")[1]!);

    expect(onSave).toHaveBeenCalledWith({
      stickyThreadsEnabled: true,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: false,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });
  });

  it("shows the configured upstream transport", () => {
    renderRoutingSettings(BASE_SETTINGS);

    expect(screen.getByText("Upstream stream transport")).toBeInTheDocument();
    expect(screen.getByText("Use server setting")).toBeInTheDocument();
    expect(screen.getByText("First placement of new sessions")).toBeInTheDocument();
    expect(screen.getByText("Repeated prompt-cache traffic")).toBeInTheDocument();
  });

  it("renders help buttons for routing strategy, sticky threads, and prompt-cache ttl", () => {
    renderRoutingSettings(BASE_SETTINGS);

    expect(
      screen.getByRole("button", { name: "Show routing strategy help" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show sticky threads help" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show full weekly quota priority help" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show prompt-cache affinity help" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show new Codex session spread help" }),
    ).toBeInTheDocument();
  });

  it("saves weekly reset preference changes from the select", async () => {
    const user = userEvent.setup();
    const { onSave } = renderRoutingSettings(BASE_SETTINGS);

    const weeklyResetSelect = screen.getAllByRole("combobox")[2]!;
    await user.click(weeklyResetSelect);
    await user.click(screen.getByText("Use expiring quota first"));

    expect(onSave).toHaveBeenCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "expiring_quota_priority",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: false,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });
  });

  it("saves the full weekly quota priority toggle", async () => {
    const user = userEvent.setup();
    const { onSave } = renderRoutingSettings(BASE_SETTINGS);

    await user.click(screen.getAllByRole("switch")[0]!);

    expect(onSave).toHaveBeenCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: false,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: false,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });
  });

  it("saves new Codex session spread controls", async () => {
    const user = userEvent.setup();
    const { onSave, rerender } = renderRoutingSettings(BASE_SETTINGS);

    await user.click(screen.getAllByRole("switch")[2]!);

    expect(onSave).toHaveBeenCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: true,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });

    rerender(
      <TooltipProvider>
        <RoutingSettings
          settings={{ ...BASE_SETTINGS, spreadNewCodexSessions: true }}
          busy={false}
          onSave={onSave}
        />
      </TooltipProvider>,
    );

    const spreadWindowInput = getRoutingNumberInputs()[0]!;
    await user.clear(spreadWindowInput);
    await user.type(spreadWindowInput, "90");
    await user.click(screen.getByRole("button", { name: "Save window" }));

    expect(onSave).toHaveBeenLastCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: true,
      spreadNewCodexSessionsWindowSeconds: 90,
      spreadNewCodexSessionsTopPoolSize: 5,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });

    const spreadPoolInput = getRoutingNumberInputs()[1]!;
    await user.clear(spreadPoolInput);
    await user.type(spreadPoolInput, "3");
    await user.click(screen.getByRole("button", { name: "Save pool" }));

    expect(onSave).toHaveBeenLastCalledWith({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: true,
      spreadNewCodexSessionsWindowSeconds: 60,
      spreadNewCodexSessionsTopPoolSize: 3,
      importWithoutOverwrite: false,
      totpRequiredOnLogin: false,
      apiKeyAuthEnabled: true,
    });
  });
});

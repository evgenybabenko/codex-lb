import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeader } from "@/components/layout/app-header";
import { useLocaleStore } from "@/hooks/use-locale";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { useThemeStore } from "@/hooks/use-theme";

describe("AppHeader", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en", initialized: true });
    usePrivacyStore.setState({ blurred: false });
    useThemeStore.setState({ preference: "auto", theme: "light", initialized: true });
  });

  it("shows a desktop theme switcher and updates the theme preference", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppHeader onLogout={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByRole("button", { name: "Light" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Dark" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "System" }).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: "Dark" })[0]!);

    expect(useThemeStore.getState().preference).toBe("dark");
  });
});

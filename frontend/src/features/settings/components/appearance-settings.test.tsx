import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AppearanceSettings } from "@/features/settings/components/appearance-settings";
import { useLocaleStore } from "@/hooks/use-locale";
import { useThemeStore } from "@/hooks/use-theme";

const LOCALE_STORAGE_KEY = "codex-lb-locale";

describe("AppearanceSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLocaleStore.setState({ locale: "en", initialized: true });
    useThemeStore.setState({ preference: "auto", theme: "light", initialized: true });
  });

  it("switches the interface language and persists the selection", async () => {
    const user = userEvent.setup();

    render(<AppearanceSettings />);

    expect(screen.getByText("Appearance")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Русский" }));

    expect(screen.getByText("Оформление")).toBeInTheDocument();
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ru");
  });
});

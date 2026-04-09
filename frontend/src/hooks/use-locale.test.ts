import { beforeEach, describe, expect, it } from "vitest";

import { useLocaleStore } from "@/hooks/use-locale";

const LOCALE_STORAGE_KEY = "codex-lb-locale";

describe("useLocaleStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLocaleStore.setState({ locale: "en", initialized: false });
  });

  it("persists manual locale changes", () => {
    useLocaleStore.getState().setLocale("ru");

    expect(useLocaleStore.getState().locale).toBe("ru");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ru");
  });

  it("initializes from stored preference", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "ru");

    useLocaleStore.getState().initializeLocale();

    expect(useLocaleStore.getState().locale).toBe("ru");
    expect(useLocaleStore.getState().initialized).toBe(true);
  });
});

import { create } from "zustand";

const LOCALE_STORAGE_KEY = "codex-lb-locale";

export type LocalePreference = "en" | "ru";

type LocaleState = {
  locale: LocalePreference;
  initialized: boolean;
  initializeLocale: () => void;
  setLocale: (locale: LocalePreference) => void;
};

function detectBrowserLocale(): LocalePreference {
  if (typeof navigator === "undefined") {
    return "en";
  }
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function readStoredPreference(): LocalePreference | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ru" || stored === "en" ? stored : null;
}

function persistLocale(locale: LocalePreference): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",
  initialized: false,
  initializeLocale: () => {
    const locale = readStoredPreference() ?? detectBrowserLocale();
    persistLocale(locale);
    set({ locale, initialized: true });
  },
  setLocale: (locale) => {
    persistLocale(locale);
    set({ locale, initialized: true });
  },
}));

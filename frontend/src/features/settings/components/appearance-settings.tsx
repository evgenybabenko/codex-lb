import { Palette } from "lucide-react";

import { useLocaleStore, type LocalePreference } from "@/hooks/use-locale";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();
  const localeOptions: { value: LocalePreference; label: string }[] = [
    { value: "en", label: t("languageEnglish") },
    { value: "ru", label: t("languageRussian") },
  ];

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t("appearanceTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("appearanceDescription")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">{t("appearanceLanguageLabel")}</p>
            <p className="text-xs text-muted-foreground">{t("appearanceLanguageDescription")}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-0.5">
            {localeOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocale(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  locale === value
                    ? "bg-background text-foreground shadow-[var(--shadow-xs)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Eye, EyeOff, LogOut, Menu, Monitor, Moon, RefreshCw, Sun } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { CodexLogo } from "@/components/brand/codex-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { useThemeStore, type ThemePreference } from "@/hooks/use-theme";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type AppHeaderProps = {
  onLogout: () => void;
  showLogout?: boolean;
  className?: string;
};

export function AppHeader({
  onLogout,
  showLogout = true,
  className,
}: AppHeaderProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const blurred = usePrivacyStore((s) => s.blurred);
  const togglePrivacy = usePrivacyStore((s) => s.toggle);
  const themePreference = useThemeStore((s) => s.preference);
  const setTheme = useThemeStore((s) => s.setTheme);
  const t = useT();
  const isDashboard = location.pathname === "/dashboard";
  const PrivacyIcon = blurred ? EyeOff : Eye;
  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
    { value: "auto", label: t("themeSystem"), icon: Monitor },
  ];
  const navItems = [
    { to: "/dashboard", label: t("navDashboard") },
    { to: "/accounts", label: t("navAccounts") },
    { to: "/apis", label: t("navApis") },
    { to: "/settings", label: t("navSettings") },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-white/[0.08] bg-background/50 px-4 py-2.5 shadow-[0_1px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-background/40 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
            <CodexLogo size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Codex LB</p>
          </div>
        </div>

        {/* Desktop nav pills */}
        <nav className="hidden items-center rounded-lg border border-border/50 bg-muted/40 p-0.5 sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative inline-flex h-7 items-center rounded-md px-3.5 text-xs leading-none font-medium transition-colors duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-[var(--shadow-xs)]"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end gap-1.5">
          {isDashboard ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              }}
              aria-label={t("dashboardRefresh")}
              className="hidden h-8 w-8 rounded-lg border border-border/50 bg-transparent p-0 text-muted-foreground transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          ) : null}
          <div className="hidden items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-0.5 sm:flex">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setTheme(value)}
                aria-label={label}
                aria-pressed={themePreference === value}
                className={cn(
                  "h-8 w-8 rounded-md p-0 text-muted-foreground transition-colors duration-200 hover:text-foreground",
                  themePreference === value && "bg-background text-foreground shadow-[var(--shadow-xs)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={togglePrivacy}
            aria-label={blurred ? t("headerShowEmails") : t("headerHideEmails")}
            className="press-scale hidden h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <PrivacyIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          {showLogout && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onLogout}
              className="press-scale hidden h-8 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {t("headerLogout")}
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t("headerOpenMenu")}
                className="h-8 w-8 rounded-lg sm:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <CodexLogo size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Codex LB</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-0.5 px-4 pt-2">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                    {({ isActive }) => (
                      <span
                        className={cn(
                          "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                ))}
                <div className="my-2 h-px bg-border" />
                {isDashboard ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setMobileOpen(false);
                      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("dashboardRefresh")}
                  </button>
                ) : null}
                {isDashboard ? <div className="my-2 h-px bg-border" /> : null}
                <div className="px-3 py-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("appearanceThemeLabel")}
                  </p>
                  <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-0.5">
                    {themeOptions.map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setTheme(value)}
                        aria-label={label}
                        aria-pressed={themePreference === value}
                        className={cn(
                          "h-8 w-8 rounded-md p-0 text-muted-foreground transition-colors duration-200 hover:text-foreground",
                          themePreference === value &&
                            "bg-background text-foreground shadow-[var(--shadow-xs)]",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="my-2 h-px bg-border" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={togglePrivacy}
                >
                  <PrivacyIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {blurred ? t("headerShowEmails") : t("headerHideEmails")}
                </button>
                {showLogout && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setMobileOpen(false);
                      onLogout();
                    }}
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("headerLogout")}
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

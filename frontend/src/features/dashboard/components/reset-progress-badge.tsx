import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseDate } from "@/utils/formatters";

export function useTimeTick() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

export function buildResetRatio(
  resetAt: string | null | undefined,
  windowMinutes: number | null | undefined,
  now: number,
): number | null {
  const resetDate = parseDate(resetAt);
  if (!resetDate || resetDate.getTime() <= 0) {
    return null;
  }
  if (typeof windowMinutes !== "number" || !Number.isFinite(windowMinutes) || windowMinutes <= 0) {
    return null;
  }
  return Math.max(0, Math.min(1, (resetDate.getTime() - now) / (windowMinutes * 60_000)));
}

export function useResetRatio(
  resetAt: string | null | undefined,
  windowMinutes: number | null | undefined,
): number | null {
  const now = useTimeTick();
  return useMemo(() => buildResetRatio(resetAt, windowMinutes, now), [now, resetAt, windowMinutes]);
}

export function ResetProgressBadge({
  ratio,
  accent,
  className,
  iconClassName,
}: {
  ratio: number | null;
  accent: "blue" | "green";
  className?: string;
  iconClassName?: string;
}) {
  const clampedRatio = ratio == null ? 0 : Math.max(0, Math.min(1, ratio));
  const angle = clampedRatio * 360;
  const gradient =
    accent === "green"
      ? `conic-gradient(from -90deg, rgb(16 185 129) ${angle}deg, transparent ${angle}deg 360deg)`
      : `conic-gradient(from -90deg, rgb(59 130 246) ${angle}deg, transparent ${angle}deg 360deg)`;

  return (
    <span className={cn("relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full", className)}>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-70"
        style={{ background: gradient }}
      />
      <span className="absolute inset-[3px] rounded-full bg-card" />
      <Clock className={cn("relative h-3.5 w-3.5", iconClassName)} />
    </span>
  );
}

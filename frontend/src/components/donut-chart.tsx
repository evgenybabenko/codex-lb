import type { CSSProperties, ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { ResetProgressBadge, useResetRatio } from "@/features/dashboard/components/reset-progress-badge";
import { cn } from "@/lib/utils";
import { buildDonutPalette } from "@/utils/colors";
import { formatCompactMetricNumber } from "@/utils/formatters";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { useThemeStore } from "@/hooks/use-theme";

export type DonutChartItem = {
  /** Stable unique key for React reconciliation. Falls back to label if not provided. */
  id?: string;
  label: string;
  workspaceLabel?: string;
  resetLabel?: string | null;
  resetAt?: string | null;
  windowMinutes?: number | null;
  /** When true the label text gets CSS-blurred in privacy mode. */
  isEmail?: boolean;
  value: number;
  capacityValue?: number | null;
  remainingPercent?: number | null;
  color?: string;
};

export type DonutChartProps = {
  items: DonutChartItem[];
  total: number;
  centerValue?: number;
  title: string;
  subtitle?: string;
  className?: string;
  headerActions?: ReactNode;
  legendHeader?: ReactNode;
  hideLegend?: boolean;
  layout?: "default" | "chart-only";
  safeLine?: { safePercent: number; riskLevel: "safe" | "warning" | "danger" | "critical" } | null;
  timeAccent?: "blue" | "green";
};

function SafeLineTick({
  cx,
  cy,
  safePercent,
  riskLevel,
  innerRadius,
  outerRadius,
  isDark,
}: {
  cx: number;
  cy: number;
  safePercent: number;
  riskLevel: "safe" | "warning" | "danger" | "critical";
  innerRadius: number;
  outerRadius: number;
  isDark: boolean;
}) {
  const remainingBudget = 100 - safePercent;
  const angleDeg = 90 - (remainingBudget / 100) * 360;
  const angleRad = -(angleDeg * Math.PI) / 180;
  const strokeOpacity = riskLevel === "safe" ? 0.7 : 1;

  const x1 = cx + innerRadius * Math.cos(angleRad);
  const y1 = cy + innerRadius * Math.sin(angleRad);
  const x2 = cx + outerRadius * Math.cos(angleRad);
  const y2 = cy + outerRadius * Math.sin(angleRad);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isDark ? "#ffffff" : "#000000"}
      strokeOpacity={strokeOpacity}
      strokeWidth={2}
      strokeLinecap="round"
      data-testid="safe-line-tick"
    />
  );
}

const CHART_SIZE = 144;
const CHART_MARGIN = 1;
const PIE_CX = 71;
const PIE_CY = 71;
const INNER_R = 53;
const OUTER_R = 71;
const LEGEND_GRID_COLUMNS =
  "grid-cols-[minmax(0,3.15fr)_minmax(50px,0.54fr)_minmax(72px,0.66fr)_minmax(66px,0.56fr)] md:grid-cols-[minmax(0,2.9fr)_minmax(56px,0.54fr)_minmax(88px,0.68fr)_minmax(78px,0.58fr)]";

function LegendRow({
  item,
  blurred,
  timeAccent,
  style,
}: {
  item: DonutChartItem;
  blurred: boolean;
  timeAccent: "blue" | "green";
  style?: CSSProperties;
}) {
  const resetRatio = useResetRatio(item.resetAt, item.windowMinutes);

  return (
    <div
      className={`animate-fade-in-up grid ${LEGEND_GRID_COLUMNS} items-center gap-x-2.5 gap-y-1 text-xs`}
      style={style}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="block truncate font-medium">
          {item.isEmail && blurred ? <span className="privacy-blur">{item.label}</span> : item.label}
        </span>
      </div>
      <span className="justify-self-start truncate text-[11px] text-muted-foreground">
        {item.workspaceLabel ?? "—"}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-1 justify-self-start">
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {item.capacityValue && item.capacityValue > 0
            ? `${formatCompactMetricNumber(item.value)}/${formatCompactMetricNumber(item.capacityValue)}`
            : formatCompactMetricNumber(item.value)}
        </span>
        <span className="h-1.5 w-[48px] max-w-full overflow-hidden rounded-full bg-muted/60 md:w-[60px]">
          <span
            className={timeAccent === "green" ? "block h-full rounded-full bg-emerald-400/90" : "block h-full rounded-full bg-blue-400/90"}
            style={{ width: `${Math.max(0, Math.min(100, item.remainingPercent ?? 0))}%` }}
          />
        </span>
      </div>
      <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap text-[11px] text-muted-foreground justify-self-start">
        <ResetProgressBadge
          ratio={resetRatio}
          accent={timeAccent}
          className="h-[18px] w-[18px]"
          iconClassName="h-[10px] w-[10px]"
        />
        <span className="truncate">{item.resetLabel ?? "—"}</span>
      </span>
    </div>
  );
}

export function DonutChart({
  items,
  total,
  centerValue,
  title,
  subtitle,
  className,
  headerActions,
  legendHeader,
  hideLegend = false,
  layout = "default",
  safeLine,
  timeAccent = "blue",
}: DonutChartProps) {
  const isDark = useThemeStore((s) => s.theme === "dark");
  const blurred = usePrivacyStore((s) => s.blurred);
  const reducedMotion = useReducedMotion();
  const consumedColor = isDark ? "#404040" : "#d3d3d3";
  const palette = buildDonutPalette(items.length, isDark);
  const normalizedItems = items.map((item, index) => ({
    ...item,
    color: item.color ?? palette[index % palette.length],
  }));

  const usedSum = normalizedItems.reduce((acc, item) => acc + Math.max(0, item.value), 0);
  const consumed = Math.max(0, total - usedSum);
  const displayedTotal = Math.max(0, centerValue ?? total);

  const chartData = [
    ...normalizedItems.map((item) => ({
      name: item.label,
      value: Math.max(0, item.value),
      fill: item.color,
    })),
    ...(consumed > 0
      ? [{ name: "__consumed__", value: consumed, fill: consumedColor }]
      : []),
  ];

  const hasData = chartData.some((d) => d.value > 0);
  if (!hasData) {
    chartData.length = 0;
    chartData.push({ name: "__empty__", value: 1, fill: consumedColor });
  }

  const chartOnly = layout === "chart-only";

  return (
    <div
      className={cn(
        chartOnly ? "w-full" : "w-full max-w-full overflow-hidden rounded-xl border bg-card p-4 sm:p-5",
        className,
      )}
    >
      {!chartOnly ? (
        <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {headerActions ? <div className="min-w-0 w-full sm:w-auto sm:shrink-0">{headerActions}</div> : null}
        </div>
      ) : null}

      <div
        className={cn(
          chartOnly
            ? "flex w-full items-center justify-center"
            : "flex w-full min-w-0 flex-col gap-4 md:flex-row md:items-stretch md:gap-6",
        )}
      >
        <div
          className={cn(
            chartOnly
              ? "flex shrink-0 flex-col items-center justify-center"
              : "mx-auto flex shrink-0 flex-col items-center md:mx-0 md:w-40 md:self-stretch md:items-start md:justify-center md:pt-7",
          )}
        >
          <div className="relative h-36 w-36 overflow-visible">
            <PieChart width={CHART_SIZE} height={CHART_SIZE} margin={{ top: CHART_MARGIN, right: CHART_MARGIN, bottom: CHART_MARGIN, left: CHART_MARGIN }}>
              <Pie
                data={chartData}
                cx={PIE_CX}
                cy={PIE_CY}
                innerRadius={INNER_R}
                outerRadius={OUTER_R}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                isAnimationActive={!reducedMotion}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
            {safeLine ? (
              <svg className="pointer-events-none absolute inset-0" width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                <SafeLineTick
                  cx={PIE_CX + CHART_MARGIN}
                  cy={PIE_CY + CHART_MARGIN}
                  safePercent={safeLine.safePercent}
                  riskLevel={safeLine.riskLevel}
                  innerRadius={INNER_R}
                  outerRadius={OUTER_R}
                  isDark={isDark}
                />
              </svg>
            ) : null}
            <div className="pointer-events-none absolute inset-[18px] flex items-center justify-center rounded-full px-3 text-center">
              <div className="space-y-0.5 text-[13px] font-semibold leading-none tabular-nums sm:text-sm">
                <div>{`${formatCompactMetricNumber(displayedTotal)}/`}</div>
                <div>{formatCompactMetricNumber(total)}</div>
              </div>
            </div>
          </div>
        </div>

        {!chartOnly && !hideLegend ? (
          <div className="min-w-0 flex-1 space-y-2.5 md:-mt-8">
            {legendHeader ? (
              <div className="border-b pb-2 text-[11px] text-muted-foreground">
                {legendHeader}
              </div>
            ) : null}
            {normalizedItems.map((item, i) => (
              <LegendRow
                key={item.id ?? item.label}
                item={item}
                blurred={blurred}
                timeAccent={timeAccent}
                style={{ animationDelay: `${i * 75}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

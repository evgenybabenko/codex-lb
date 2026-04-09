import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useT } from "@/lib/i18n";

const CHART_MARGIN = { top: 2, right: 0, bottom: 2, left: 0 } as const;

export type SparklineChartProps = {
  data: { value: number; t: string; label: string }[];
  color: string;
  index: number;
  height?: number;
};

export function SparklineChart({ data, color, index, height = 56 }: SparklineChartProps) {
  const t = useT();
  const reducedMotion = useReducedMotion();
  const gradientId = `sparkline-fill-${index}`;
  const labels = Array.from(new Set(data.map((point) => point.label)));

  return (
    <div className="space-y-1" aria-label={t("dashboardSparklineAxisAria")}>
      <ResponsiveContainer width="100%" height={height - 16}>
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={!reducedMotion}
            animationDuration={500}
            animationBegin={index * 100}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="grid text-[9px] leading-none text-muted-foreground" style={{ gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, minmax(0, 1fr))` }}>
        {labels.map((label, labelIndex) => (
          <span
            key={`${label}-${labelIndex}`}
            className={labelIndex === 0 ? "text-left" : labelIndex === labels.length - 1 ? "text-right" : "text-center"}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

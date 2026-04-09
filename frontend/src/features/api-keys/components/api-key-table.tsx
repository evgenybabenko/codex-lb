import { Ellipsis, KeyRound, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiKey, LimitRule, LimitType } from "@/features/api-keys/schemas";
import { useT } from "@/lib/i18n";
import { formatCompactNumber, formatCurrency, formatTimeLong } from "@/utils/formatters";

function formatExpiry(value: string | null, t: ReturnType<typeof useT>): string {
  if (!value) {
    return t("commonNever");
  }
  const parsed = formatTimeLong(value);
  return `${parsed.date} ${parsed.time}`;
}

function formatLimitSummary(limits: LimitRule[], t: ReturnType<typeof useT>): string {
  if (limits.length === 0) return "-";
  return limits
    .map((l) => {
      const type =
        {
          total_tokens: t("apiLimitTypeShortTokens"),
          input_tokens: t("apiLimitTypeShortInput"),
          output_tokens: t("apiLimitTypeShortOutput"),
          cost_usd: t("apiLimitTypeShortCost"),
        }[l.limitType as LimitType];
      const isCost = l.limitType === "cost_usd";
      const current = isCost
        ? `$${(l.currentValue / 1_000_000).toFixed(2)}`
        : formatCompactNumber(l.currentValue);
      const max = isCost
        ? `$${(l.maxValue / 1_000_000).toFixed(2)}`
        : formatCompactNumber(l.maxValue);
      return `${type}: ${current}/${max} ${l.limitWindow}`;
    })
    .join(" | ");
}

function formatUsageSummary(
  requestCount: number,
  totalTokens: number,
  cachedInputTokens: number,
  totalCostUsd: number,
  t: ReturnType<typeof useT>,
): string {
  const total = formatCompactNumber(totalTokens);
  const cached = formatCompactNumber(cachedInputTokens);
  const requests = formatCompactNumber(requestCount);
  const cost = formatCurrency(totalCostUsd);
  return `${total} ${t("commonTokensShort")} | ${cached} ${t("commonCachedShort")} | ${requests} ${t("commonRequestsShort")} | ${cost}`;
}

function getUsageValue(apiKey: ApiKey, t: ReturnType<typeof useT>): string {
  if (!apiKey.usageSummary) {
    return t("apiNoUsageRecorded");
  }

  return formatUsageSummary(
    apiKey.usageSummary.requestCount,
    apiKey.usageSummary.totalTokens,
    apiKey.usageSummary.cachedInputTokens,
    apiKey.usageSummary.totalCostUsd,
    t,
  );
}

function getLimitValue(apiKey: ApiKey, t: ReturnType<typeof useT>): string {
  if (apiKey.limits.length === 0) {
    return t("commonNoLimit");
  }

  return formatLimitSummary(apiKey.limits, t);
}

export type ApiKeyTableProps = {
  keys: ApiKey[];
  busy: boolean;
  onEdit: (apiKey: ApiKey) => void;
  onDelete: (apiKey: ApiKey) => void;
  onRegenerate: (apiKey: ApiKey) => void;
};

export function ApiKeyTable({ keys, busy, onEdit, onDelete, onRegenerate }: ApiKeyTableProps) {
  const t = useT();
  if (keys.length === 0) {
    return <EmptyState icon={KeyRound} title={t("apiTableEmpty")} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[20%] min-w-[12rem] pl-4 text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("apiTableName")}</TableHead>
          <TableHead className="w-[10%] min-w-[8rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("apiTablePrefix")}</TableHead>
          <TableHead className="w-[9%] min-w-[6.5rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("apiTableModels")}</TableHead>
          <TableHead className="w-[26%] min-w-[17rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("apiTableUsage")}</TableHead>
          <TableHead className="w-[14%] min-w-[12rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("apiTableLimit")}</TableHead>
          <TableHead className="w-[7%] min-w-[5.5rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("commonExpiry")}</TableHead>
          <TableHead className="w-[8%] min-w-[6.5rem] text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("commonStatus")}</TableHead>
          <TableHead className="w-[5%] min-w-[4rem] pr-4 text-right text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("commonActions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((apiKey) => {
          const models = apiKey.allowedModels?.join(", ") || t("commonAll");

          return (
            <TableRow key={apiKey.id}>
              <TableCell className="pl-4 font-medium truncate">{apiKey.name}</TableCell>
              <TableCell className="truncate font-mono text-xs">{apiKey.keyPrefix}</TableCell>
              <TableCell className="truncate">{models}</TableCell>
              <TableCell className="text-xs tabular-nums leading-tight whitespace-normal">{getUsageValue(apiKey, t)}</TableCell>
              <TableCell className="text-xs tabular-nums leading-tight whitespace-normal">{getLimitValue(apiKey, t)}</TableCell>
              <TableCell className="truncate text-xs text-muted-foreground">{formatExpiry(apiKey.expiresAt, t)}</TableCell>
              <TableCell>
                <Badge className={apiKey.isActive ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}>
                  {apiKey.isActive ? t("commonActive") : t("commonDisabled")}
                </Badge>
              </TableCell>
              <TableCell className="pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon-sm" variant="ghost" disabled={busy}>
                      <Ellipsis className="size-4" />
                      <span className="sr-only">{t("commonActions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(apiKey)}>
                      <Pencil className="size-4" />
                      {t("commonEdit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRegenerate(apiKey)}>
                      <RefreshCw className="size-4" />
                      {t("commonRegenerate")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(apiKey)}>
                      <Trash2 className="size-4" />
                      {t("commonDelete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}

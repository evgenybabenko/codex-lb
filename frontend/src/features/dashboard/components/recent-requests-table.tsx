import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";

import { isEmailLabel } from "@/components/blur-email";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PaginationControls } from "@/features/dashboard/components/filters/pagination-controls";
import type { AccountSummary, RequestLog } from "@/features/dashboard/schemas";
import { useT } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatCurrency,
  formatModelLabel,
  formatTimeLong,
} from "@/utils/formatters";

const STATUS_CLASS_MAP: Record<string, string> = {
  ok: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400",
  rate_limit: "bg-orange-500/15 text-orange-700 border-orange-500/20 hover:bg-orange-500/20 dark:text-orange-400",
  quota: "bg-red-500/15 text-red-700 border-red-500/20 hover:bg-red-500/20 dark:text-red-400",
  error: "bg-zinc-500/15 text-zinc-700 border-zinc-500/20 hover:bg-zinc-500/20 dark:text-zinc-400",
};

const TRANSPORT_LABELS: Record<string, string> = {
  http: "HTTP",
  websocket: "WS",
};

const TRANSPORT_TITLES: Record<string, string> = {
  http: "HTTP",
  websocket: "WebSocket",
};

const TRANSPORT_CLASS_MAP: Record<string, string> = {
  http: "bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/15 dark:text-slate-300",
  websocket: "bg-sky-500/15 text-sky-700 border-sky-500/20 hover:bg-sky-500/20 dark:text-sky-300",
};

function getRequestStatusLabel(status: string, t: ReturnType<typeof useT>): string {
  switch (status) {
    case "ok":
      return t("requestStatusOk");
    case "rate_limit":
      return t("requestStatusRateLimit");
    case "quota":
      return t("requestStatusQuota");
    case "error":
      return t("requestStatusError");
    default:
      return status;
  }
}

export type RecentRequestsTableProps = {
  requests: RequestLog[];
  accounts: AccountSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  onLimitChange: (limit: number) => void;
  onOffsetChange: (offset: number) => void;
};

export function RecentRequestsTable({
  requests,
  accounts,
  total,
  limit,
  offset,
  hasMore,
  onLimitChange,
  onOffsetChange,
}: RecentRequestsTableProps) {
  const [showInlineErrors, setShowInlineErrors] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<RequestLog | null>(null);
  const blurred = usePrivacyStore((s) => s.blurred);
  const t = useT();

  const accountLabelMap = useMemo(() => {
    const index = new Map<string, string>();
    for (const account of accounts) {
      index.set(account.accountId, account.displayName || account.email || account.accountId);
    }
    return index;
  }, [accounts]);

  /** Account IDs whose label is an email. */
  const emailLabelIds = useMemo(() => {
    const ids = new Set<string>();
    for (const account of accounts) {
      const label = account.displayName || account.email;
      if (isEmailLabel(label, account.email)) {
        ids.add(account.accountId);
      }
    }
    return ids;
  }, [accounts]);

  return (
    <TooltipProvider>
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">{t("requestLogVisibilityTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("requestLogVisibilityDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {showInlineErrors ? t("requestLogVisibilityOn") : t("requestLogVisibilityOff")}
          </span>
          <Switch
            aria-label={t("requestLogsInlineErrorAria")}
            checked={showInlineErrors}
            onCheckedChange={setShowInlineErrors}
          />
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("requestLogsEmptyTitle")}
          description={t("requestLogsEmptyDescription")}
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <div className="relative overflow-x-auto">
            <Table className="min-w-[1020px] table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28 pl-4 whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsTime")}</TableHead>
                  <TableHead className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsAccount")}</TableHead>
                  <TableHead className="w-24 whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsApiKey")}</TableHead>
                  <TableHead className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsModel")}</TableHead>
                  <TableHead className="w-20 whitespace-nowrap text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsTransportShort")}</TableHead>
                  <TableHead className="w-24 whitespace-nowrap text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsStatus")}</TableHead>
                  <TableHead className="w-24 whitespace-nowrap text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsTokens")}</TableHead>
                  <TableHead className="w-20 whitespace-nowrap pr-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsCost")}</TableHead>
                  <TableHead className="w-32 pr-4 whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{t("requestLogsError")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const time = formatTimeLong(request.requestedAt);
                  const accountLabel = request.accountId ? (accountLabelMap.get(request.accountId) ?? request.accountId) : "—";
                  const isEmailLabel = !!(request.accountId && emailLabelIds.has(request.accountId));
                  const errorMessage = request.errorMessage || request.errorCode || "-";
                  const hasLongError = errorMessage !== "-" && errorMessage.length > 72;
                  const visibleServiceTier = request.actualServiceTier ?? request.serviceTier;
                  const showRequestedTier =
                    !!request.requestedServiceTier && request.requestedServiceTier !== visibleServiceTier;
                  const canOpenDetail = errorMessage !== "-" || request.requestId.length > 0;
                  const inlineErrorText = showInlineErrors ? errorMessage : request.errorCode || "-";

                  return (
                    <TableRow key={request.requestId}>
                      <TableCell className="pl-4 align-top">
                        <div className="leading-tight">
                          <div className="text-sm font-medium">{time.time}</div>
                          <div className="text-xs text-muted-foreground">{time.date}</div>
                        </div>
                      </TableCell>
                      <TableCell className="truncate align-top text-sm">
                        {isEmailLabel && blurred ? (
                          <span className="privacy-blur">{accountLabel}</span>
                        ) : (
                          accountLabel
                        )}
                      </TableCell>
                      <TableCell className="w-24 truncate align-top text-xs text-muted-foreground">
                        {request.apiKeyName || "--"}
                      </TableCell>
                      <TableCell className="truncate align-top">
                        <div className="leading-tight">
                          <span className="font-mono text-xs">
                            {formatModelLabel(request.model, request.reasoningEffort, visibleServiceTier)}
                          </span>
                          {showRequestedTier ? (
                            <div className="text-[11px] text-muted-foreground">
                              {t("requestLogsRequestedPrefix")} {request.requestedServiceTier}
                            </div>
                          ) : null}
                          <div className="text-[11px] text-muted-foreground">
                            {t("requestLogsRequestPrefix")} {request.requestId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        {request.transport ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={TRANSPORT_CLASS_MAP[request.transport] ?? TRANSPORT_CLASS_MAP.http}
                              >
                                {TRANSPORT_LABELS[request.transport] ?? request.transport}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {TRANSPORT_TITLES[request.transport] ?? request.transport}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <Badge
                          variant="outline"
                          className={STATUS_CLASS_MAP[request.status] ?? STATUS_CLASS_MAP.error}
                        >
                          {getRequestStatusLabel(request.status, t)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs tabular-nums">
                        <div className="leading-tight">
                          <div>{formatCompactNumber(request.tokens)}</div>
                          {request.cachedInputTokens != null && request.cachedInputTokens > 0 && (
                            <div className="text-[11px] text-muted-foreground">
                              {formatCompactNumber(request.cachedInputTokens)} {t("requestLogsCachedSuffix")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top font-mono text-xs tabular-nums">
                        {formatCurrency(request.costUsd)}
                      </TableCell>
                      <TableCell className="overflow-hidden pr-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <p className="min-w-0 truncate text-xs text-muted-foreground">
                            {inlineErrorText}
                          </p>
                          {(hasLongError || !showInlineErrors) && canOpenDetail ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 shrink-0 px-1.5 text-[11px]"
                              onClick={() => setViewingRequest(request)}
                            >
                              {t("requestLogsView")}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <PaginationControls
          total={total}
          limit={limit}
          offset={offset}
          hasMore={hasMore}
          onLimitChange={onLimitChange}
          onOffsetChange={onOffsetChange}
        />
      </div>

      <Dialog open={viewingRequest !== null} onOpenChange={(open) => { if (!open) setViewingRequest(null); }}>
        <DialogContent className="max-h-[80vh] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("requestLogsErrorDetail")}</DialogTitle>
            <DialogDescription>
              {viewingRequest
                ? `${t("requestLogsRequestPrefix")} ${viewingRequest.requestId}`
                : t("requestLogsErrorDetailDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 rounded-md bg-muted/40 p-3 text-xs">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("requestLogsRequestId")}</p>
                <p className="mt-1 font-mono">{viewingRequest?.requestId ?? "--"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("requestLogsModel")}</p>
                <p className="mt-1 font-mono">{viewingRequest?.model ?? "--"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("requestLogsTotalLatency")}</p>
                <p className="mt-1 font-mono">
                  {viewingRequest?.latencyMs != null ? `${viewingRequest.latencyMs} ms` : "--"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">{t("requestLogsFirstToken")}</p>
                <p className="mt-1 font-mono">
                  {viewingRequest?.latencyFirstTokenMs != null ? `${viewingRequest.latencyFirstTokenMs} ms` : "--"}
                </p>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto rounded-md bg-muted/50 p-3">
              <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                {viewingRequest?.errorMessage || viewingRequest?.errorCode || "-"}
              </p>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

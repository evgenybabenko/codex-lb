import { useMemo, useState } from "react";
import { Pin } from "lucide-react";

import { AlertMessage } from "@/components/alert-message";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SpinnerBlock } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/features/dashboard/components/filters/pagination-controls";
import { useStickySessions } from "@/features/sticky-sessions/hooks/use-sticky-sessions";
import type { StickySessionEntry, StickySessionIdentifier, StickySessionKind } from "@/features/sticky-sessions/schemas";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useT } from "@/lib/i18n";
import { getErrorMessageOrNull } from "@/utils/errors";
import { formatTimeLong } from "@/utils/formatters";

function kindLabel(kind: StickySessionKind, t: ReturnType<typeof useT>): string {
  switch (kind) {
    case "codex_session":
      return t("stickyKindCodexSession");
    case "sticky_thread":
      return t("stickyKindStickyThread");
    case "prompt_cache":
      return t("stickyKindPromptCache");
  }
}

function stickySessionRowId(entry: StickySessionIdentifier): string {
  return `${entry.kind}:${entry.key}`;
}

const EMPTY_STICKY_SESSION_ENTRIES: StickySessionEntry[] = [];

export function StickySessionsSection() {
  const t = useT();
  const { params, setLimit, setOffset, stickySessionsQuery, deleteMutation, purgeMutation } = useStickySessions();
  const deleteDialog = useDialogState<StickySessionIdentifier>();
  const deleteSelectedDialog = useDialogState<StickySessionIdentifier[]>();
  const purgeDialog = useDialogState();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const mutationError = useMemo(
    () =>
      getErrorMessageOrNull(stickySessionsQuery.error) ||
      getErrorMessageOrNull(deleteMutation.error) ||
      getErrorMessageOrNull(purgeMutation.error),
    [stickySessionsQuery.error, deleteMutation.error, purgeMutation.error],
  );

  const entries = stickySessionsQuery.data?.entries ?? EMPTY_STICKY_SESSION_ENTRIES;
  const staleCount = stickySessionsQuery.data?.stalePromptCacheCount ?? 0;
  const total = stickySessionsQuery.data?.total ?? 0;
  const hasMore = stickySessionsQuery.data?.hasMore ?? false;
  const busy = deleteMutation.isPending || purgeMutation.isPending;
  const hasEntries = entries.length > 0;
  const hasAnyRows = total > 0;
  const selectedRowIdSet = useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
  const selectedEntries = useMemo(
    () =>
      entries
        .filter((entry) => selectedRowIdSet.has(stickySessionRowId(entry)))
        .map(({ key, kind }) => ({ key, kind })),
    [entries, selectedRowIdSet],
  );
  const selectedCount = selectedEntries.length;
  const allVisibleSelected = hasEntries && selectedCount === entries.length;
  const someVisibleSelected = selectedCount > 0 && !allVisibleSelected;
  const selectedDeleteTargets = deleteSelectedDialog.data ?? [];
  const selectedDeleteCount = selectedDeleteTargets.length;

  const setSelected = (target: StickySessionIdentifier, checked: boolean) => {
    const rowId = stickySessionRowId(target);
    setSelectedRowIds((current) => {
      if (checked) {
        return current.includes(rowId) ? current : [...current, rowId];
      }
      return current.filter((value) => value !== rowId);
    });
  };

  const setAllVisibleSelected = (checked: boolean) => {
    setSelectedRowIds(checked ? entries.map((entry) => stickySessionRowId(entry)) : []);
  };

  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Pin className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
          <h3 className="text-sm font-semibold">{t("stickyTitle")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("stickyDescription")}
          </p>
        </div>
      </div>

      {mutationError ? <AlertMessage variant="error">{mutationError}</AlertMessage> : null}

      <div className="flex flex-col gap-3 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t("stickyVisibleRows")}</span>
            <span className="text-sm font-medium tabular-nums">{total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t("stickyStalePromptCache")}</span>
            <span className="text-sm font-medium tabular-nums">{staleCount}</span>
          </div>
          {selectedCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{t("stickySelected")}</span>
              <span className="text-sm font-medium tabular-nums">{selectedCount}</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 text-xs"
            disabled={busy || selectedCount === 0}
            onClick={() => deleteSelectedDialog.show(selectedEntries)}
          >
            {t("commonRemoveSelected")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={busy || staleCount === 0}
            onClick={() => purgeDialog.show()}
          >
            {t("stickyPurgeStale")}
          </Button>
        </div>
      </div>

      {stickySessionsQuery.isLoading && !stickySessionsQuery.data ? (
        <div className="py-8">
          <SpinnerBlock />
        </div>
      ) : !hasAnyRows ? (
        <EmptyState
          icon={Pin}
          title={t("stickyEmptyTitle")}
          description={t("stickyEmptyDescription")}
        />
      ) : (
        <>
          {hasEntries ? (
            <div className="overflow-x-auto rounded-xl border">
              <Table className="min-w-[1120px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[52px] pl-4 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      <Checkbox
                        aria-label={t("stickySelectAll")}
                        checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                        disabled={busy || !hasEntries}
                        onCheckedChange={(checked) => setAllVisibleSelected(checked === true)}
                      />
                    </TableHead>
                    <TableHead className="w-[250px] text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("stickyKey")}
                    </TableHead>
                    <TableHead className="w-[150px] text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("stickyKind")}
                    </TableHead>
                    <TableHead className="w-[190px] text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("stickyAccount")}
                    </TableHead>
                    <TableHead className="w-[150px] text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("stickyUpdated")}
                    </TableHead>
                    <TableHead className="w-[150px] text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("stickyExpiry")}
                    </TableHead>
                    <TableHead className="w-[130px] pr-4 text-right align-middle text-[11px] uppercase tracking-wider text-muted-foreground/80">
                      {t("commonActions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const updated = formatTimeLong(entry.updatedAt);
                    const expires = entry.expiresAt ? formatTimeLong(entry.expiresAt) : null;
                    const selected = selectedRowIdSet.has(stickySessionRowId(entry));
                    return (
                      <TableRow key={`${entry.kind}:${entry.key}`} data-state={selected ? "selected" : undefined}>
                        <TableCell className="pl-4">
                          <Checkbox
                            aria-label={t("stickySelectOne", { key: entry.key })}
                            checked={selected}
                            disabled={busy}
                            onCheckedChange={(checked) => setSelected(entry, checked === true)}
                          />
                        </TableCell>
                        <TableCell className="max-w-[18rem] truncate font-mono text-xs" title={entry.key}>
                          {entry.key}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge variant="outline" className="max-w-full whitespace-nowrap">
                            {kindLabel(entry.kind, t)}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate text-xs" title={entry.displayName}>
                          {entry.displayName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="leading-tight">
                            <div className="whitespace-nowrap">{updated.date}</div>
                            <div className="whitespace-nowrap">{updated.time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.isStale ? (
                            <Badge variant="secondary" className="whitespace-nowrap">
                              {t("stickyStale")}
                            </Badge>
                          ) : expires ? (
                            <div className="leading-tight">
                              <div className="whitespace-nowrap">{expires.date}</div>
                              <div className="whitespace-nowrap">{expires.time}</div>
                            </div>
                          ) : (
                            <span className="whitespace-nowrap">{t("stickyDurable")}</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="whitespace-nowrap px-2 text-destructive hover:text-destructive"
                            disabled={busy}
                            onClick={() => deleteDialog.show({ key: entry.key, kind: entry.kind })}
                          >
                            {t("commonRemove")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Pin}
              title={t("stickyEmptyPageTitle")}
              description={t("stickyEmptyPageDescription")}
            />
          )}
          <div className="flex justify-end pt-3">
            <PaginationControls
              total={total}
              limit={params.limit}
              offset={params.offset}
              hasMore={hasMore}
              onLimitChange={setLimit}
              onOffsetChange={setOffset}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title={t("stickyRemoveTitle")}
        description={
          deleteDialog.data
            ? t("stickyRemoveDescription", {
                kind: kindLabel(deleteDialog.data.kind, t),
                key: deleteDialog.data.key,
              })
            : ""
        }
        confirmLabel={t("commonRemove")}
        onOpenChange={deleteDialog.onOpenChange}
        onConfirm={() => {
          if (!deleteDialog.data) {
            return;
          }
          void deleteMutation.mutateAsync([deleteDialog.data]).finally(() => {
            deleteDialog.hide();
          });
        }}
      />

      <ConfirmDialog
        open={deleteSelectedDialog.open}
        title={t("stickyRemoveSelectedTitle")}
        description={
          selectedDeleteCount === 1
            ? t("stickyRemoveSelectedOne")
            : t("stickyRemoveSelectedMany", { count: selectedDeleteCount })
        }
        confirmLabel={t("commonRemoveSelected")}
        onOpenChange={deleteSelectedDialog.onOpenChange}
        onConfirm={() => {
          if (selectedDeleteTargets.length === 0) {
            return;
          }
          void deleteMutation.mutateAsync(selectedDeleteTargets).finally(() => {
            setSelectedRowIds([]);
            deleteSelectedDialog.hide();
          });
        }}
      />

      <ConfirmDialog
        open={purgeDialog.open}
        title={t("stickyPurgeTitle")}
        description={t("stickyPurgeDescription")}
        confirmLabel={t("stickyPurgeStale")}
        onOpenChange={purgeDialog.onOpenChange}
        onConfirm={() => {
          void purgeMutation.mutateAsync(true).finally(() => {
            purgeDialog.hide();
          });
        }}
      />
    </section>
  );
}

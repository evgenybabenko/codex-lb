import { Pause, Play, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AccountSummary } from "@/features/accounts/schemas";
import { useT } from "@/lib/i18n";

export type AccountActionsProps = {
  account: AccountSummary;
  busy: boolean;
  onPause: (accountId: string) => void;
  onResume: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onReauth: () => void;
};

export function AccountActions({
  account,
  busy,
  onPause,
  onResume,
  onDelete,
  onReauth,
}: AccountActionsProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      {account.status === "paused" ? (
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => onResume(account.accountId)}
          disabled={busy}
        >
          <Play className="h-3.5 w-3.5" />
          {t("accountActionResume")}
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={() => onPause(account.accountId)}
          disabled={busy}
        >
          <Pause className="h-3.5 w-3.5" />
          {t("accountActionPause")}
        </Button>
      )}

      {account.status === "deactivated" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={onReauth}
          disabled={busy}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("accountActionReauth")}
        </Button>
      ) : null}

      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="h-8 gap-1.5 text-xs"
        onClick={() => onDelete(account.accountId)}
        disabled={busy}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t("commonDelete")}
      </Button>
    </div>
  );
}

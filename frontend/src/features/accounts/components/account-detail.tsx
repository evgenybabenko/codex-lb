import { User } from "lucide-react";

import { isEmailLabel } from "@/components/blur-email";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { AccountActions } from "@/features/accounts/components/account-actions";
import { AccountTokenInfo } from "@/features/accounts/components/account-token-info";
import { AccountUsagePanel } from "@/features/accounts/components/account-usage-panel";
import type { AccountSummary } from "@/features/accounts/schemas";
import { useAccountTrends } from "@/features/accounts/hooks/use-accounts";
import { useT } from "@/lib/i18n";
import { formatWorkspaceLabel, formatWorkspaceTitle } from "@/utils/account-identifiers";

export type AccountDetailProps = {
  account: AccountSummary | null;
  showAccountId?: boolean;
  busy: boolean;
  onPause: (accountId: string) => void;
  onResume: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onReauth: () => void;
};

export function AccountDetail({
  account,
  showAccountId = false,
  busy,
  onPause,
  onResume,
  onDelete,
  onReauth,
}: AccountDetailProps) {
  const t = useT();
  const { data: trends } = useAccountTrends(account?.accountId ?? null);
  const blurred = usePrivacyStore((s) => s.blurred);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{t("accountSelectTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{t("accountSelectDescription")}</p>
      </div>
    );
  }

  const title = account.email;
  const titleIsEmail = isEmailLabel(title, account.email);
  const workspaceLabel = formatWorkspaceLabel(account);
  const workspaceTitle = formatWorkspaceTitle(account);
  const subtitle = workspaceLabel
    ? t("accountCardContextWorkspace", { value: workspaceLabel })
    : account.planType;

  return (
    <div key={account.accountId} className="animate-fade-in-up space-y-4 rounded-xl border bg-card p-5">
      {/* Account header */}
      <div>
        <h2 className="text-base font-semibold">
          {titleIsEmail ? <span className={blurred ? "privacy-blur" : ""}>{title}</span> : title}
        </h2>
        <p
          className="mt-0.5 text-xs text-muted-foreground"
          title={
            [workspaceTitle, showAccountId ? t("accountTooltipId", { id: account.accountId }) : null]
              .filter(Boolean)
              .join(" | ") || undefined
          }
        >
          {subtitle}
        </p>
      </div>

      <AccountUsagePanel account={account} trends={trends} />
      <AccountTokenInfo account={account} />
      <AccountActions
        account={account}
        busy={busy}
        onPause={onPause}
        onResume={onResume}
        onDelete={onDelete}
        onReauth={onReauth}
      />
    </div>
  );
}

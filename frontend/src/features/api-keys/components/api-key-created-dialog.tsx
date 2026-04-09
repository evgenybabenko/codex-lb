import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";

export type ApiKeyCreatedDialogProps = {
  open: boolean;
  apiKey: string | null;
  onOpenChange: (open: boolean) => void;
};

export function ApiKeyCreatedDialog({ open, apiKey, onOpenChange }: ApiKeyCreatedDialogProps) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("apiCreatedDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("apiCreatedDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        {apiKey ? (
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("requestLogsApiKey")}</p>
            <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border bg-muted/20 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs">{apiKey}</p>
              <InlineCopyButton text={apiKey} />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t("commonClose")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InlineCopyButton({ text }: { text: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 shrink-0 gap-1 px-2 text-xs"
      onClick={() => void handleCopy()}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          {t("commonCopied")}!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {t("commonCopy")}
        </>
      )}
    </Button>
  );
}

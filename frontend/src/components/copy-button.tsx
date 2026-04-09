import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export type CopyButtonProps = {
  value: string;
  label?: string;
  iconOnly?: boolean;
};

export function CopyButton({ value, label, iconOnly = false }: CopyButtonProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("commonCopiedClipboard"));
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error(t("commonFailedCopy"));
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? "icon-sm" : "sm"}
      onClick={handleCopy}
      aria-label={copied ? `${label ?? t("commonCopy")} ${t("commonCopied")}` : label ?? t("commonCopy")}
      title={copied ? t("commonCopied") : label ?? t("commonCopy")}
    >
      {copied ? <Check className={iconOnly ? "h-4 w-4" : "mr-2 h-4 w-4"} /> : <Copy className={iconOnly ? "h-4 w-4" : "mr-2 h-4 w-4"} />}
      {iconOnly ? null : copied ? t("commonCopied") : label ?? t("commonCopy")}
    </Button>
  );
}

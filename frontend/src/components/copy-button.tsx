import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label }: CopyButtonProps) {
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
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {copied ? t("commonCopied") : label ?? t("commonCopy")}
    </Button>
  );
}

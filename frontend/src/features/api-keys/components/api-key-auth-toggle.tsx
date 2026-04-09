import { Switch } from "@/components/ui/switch";
import { useT } from "@/lib/i18n";

export type ApiKeyAuthToggleProps = {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
};

export function ApiKeyAuthToggle({ enabled, disabled = false, onChange }: ApiKeyAuthToggleProps) {
  const t = useT();
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{t("apiAuthTitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("apiAuthDescription")}
        </p>
      </div>
      <Switch checked={enabled} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

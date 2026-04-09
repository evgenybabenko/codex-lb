import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AlertMessage } from "@/components/alert-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePassword, removePassword, setupPassword } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/hooks/use-auth";
import {
  PasswordChangeRequestSchema,
  PasswordRemoveRequestSchema,
  PasswordSetupRequestSchema,
} from "@/features/auth/schemas";
import { useT } from "@/lib/i18n";
import { getErrorMessage } from "@/utils/errors";

type PasswordDialog = "setup" | "change" | "remove" | null;

export type PasswordSettingsProps = {
  disabled?: boolean;
};

export function PasswordSettings({ disabled = false }: PasswordSettingsProps) {
  const t = useT();
  const passwordRequired = useAuthStore((s) => s.passwordRequired);
  const bootstrapTokenRequired = useAuthStore((s) => s.bootstrapTokenRequired);
  const refreshSession = useAuthStore((s) => s.refreshSession);

  const [activeDialog, setActiveDialog] = useState<PasswordDialog>(null);
  const [error, setError] = useState<string | null>(null);

  const setupForm = useForm({
    resolver: zodResolver(PasswordSetupRequestSchema),
    defaultValues: { password: "", bootstrapToken: "" },
  });

  const changeForm = useForm({
    resolver: zodResolver(PasswordChangeRequestSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const removeForm = useForm({
    resolver: zodResolver(PasswordRemoveRequestSchema),
    defaultValues: { password: "" },
  });

  const busy =
    setupForm.formState.isSubmitting ||
    changeForm.formState.isSubmitting ||
    removeForm.formState.isSubmitting;
  const lock = busy || disabled;

  const closeDialog = () => {
    setActiveDialog(null);
    setError(null);
    setupForm.reset();
    changeForm.reset();
    removeForm.reset();
  };

  const handleSetup = async (values: { password: string; bootstrapToken?: string }) => {
    setError(null);
    if (bootstrapTokenRequired && !values.bootstrapToken?.trim()) {
      setupForm.setError("bootstrapToken", {
        message: t("passwordBootstrapTokenMissing"),
      });
      return;
    }
    try {
      await setupPassword({
        password: values.password,
        bootstrapToken: values.bootstrapToken?.trim() || undefined,
      });
      await refreshSession();
      toast.success(t("passwordConfiguredToast"));
      closeDialog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  const handleChange = async (values: { currentPassword: string; newPassword: string }) => {
    setError(null);
    try {
      await changePassword(values);
      toast.success(t("passwordChangedToast"));
      closeDialog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  const handleRemove = async (values: { password: string }) => {
    setError(null);
    try {
      await removePassword(values);
      await refreshSession();
      toast.success(t("passwordRemovedToast"));
      closeDialog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("passwordSettingsTitle")}</h3>
            <p className="text-xs text-muted-foreground">
              {passwordRequired ? t("passwordSettingsConfigured") : t("passwordSettingsMissing")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {passwordRequired ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={lock}
                onClick={() => setActiveDialog("change")}
              >
                {t("passwordChange")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs text-destructive hover:text-destructive"
                disabled={lock}
                onClick={() => setActiveDialog("remove")}
              >
                {t("passwordRemove")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              disabled={lock}
              onClick={() => setActiveDialog("setup")}
            >
              {t("passwordSet")}
            </Button>
          )}
        </div>
        </div>
      </div>

      {/* Setup dialog */}
      <Dialog open={activeDialog === "setup"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("passwordSetDialogTitle")}</DialogTitle>
            <DialogDescription>{t("passwordSetDialogDescription")}</DialogDescription>
          </DialogHeader>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}
          <Form {...setupForm}>
            <form onSubmit={setupForm.handleSubmit(handleSetup)} className="space-y-4">
              <FormField
                control={setupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("authPasswordLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="new-password" placeholder={t("passwordMinPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {bootstrapTokenRequired ? (
                <FormField
                  control={setupForm.control}
                  name="bootstrapToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("passwordBootstrapTokenLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="off"
                          placeholder={t("passwordBootstrapTokenPlaceholder")}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("passwordBootstrapTokenDescription")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={busy}>
                  {t("commonCancel")}
                </Button>
                <Button type="submit" disabled={lock}>
                  {t("passwordSet")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change dialog */}
      <Dialog open={activeDialog === "change"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("passwordChangeDialogTitle")}</DialogTitle>
            <DialogDescription>{t("passwordChangeDialogDescription")}</DialogDescription>
          </DialogHeader>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}
          <Form {...changeForm}>
            <form onSubmit={changeForm.handleSubmit(handleChange)} className="space-y-4">
              <FormField
                control={changeForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordCurrent")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changeForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordNew")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="new-password" placeholder={t("passwordMinPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={busy}>
                  {t("commonCancel")}
                </Button>
                <Button type="submit" disabled={lock}>
                  {t("passwordChangeDialogTitle")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove dialog */}
      <Dialog open={activeDialog === "remove"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("passwordRemoveDialogTitle")}</DialogTitle>
            <DialogDescription>{t("passwordRemoveDialogDescription")}</DialogDescription>
          </DialogHeader>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}
          <Form {...removeForm}>
            <form onSubmit={removeForm.handleSubmit(handleRemove)} className="space-y-4">
              <FormField
                control={removeForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordCurrent")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="current-password" placeholder={t("passwordCurrentPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={busy}>
                  {t("commonCancel")}
                </Button>
                <Button type="submit" variant="destructive" disabled={lock}>
                  {t("passwordRemoveDialogTitle")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Button } from "./button";

/**
 * Confirmation for destructive or irreversible actions (DSH-GEN-08): names the object
 * and the consequence; the destructive action uses the danger style.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  loading = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  const t = useTranslations("common");
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-overlay animate-overlay-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-[27.5rem] -translate-x-1/2 -translate-y-1/2 rounded-md bg-sheet p-5 shadow-float animate-dialog-in">
          <AlertDialog.Title className="font-display text-heading font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-body text-graphite">{description}</AlertDialog.Description>
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">{t("cancel")}</Button>
            </AlertDialog.Cancel>
            <Button
              variant={destructive ? "danger" : "primary"}
              loading={loading}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

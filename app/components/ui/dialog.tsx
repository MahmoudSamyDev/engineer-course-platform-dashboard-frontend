import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";

const SIZES = { sm: "sm:max-w-[27.5rem]", md: "sm:max-w-[35rem]", lg: "sm:max-w-[45rem]" };

/**
 * Modal dialog (DESIGN_SYSTEM §6): title, description, scrolling body, footer actions.
 * Below 640px it fills the screen so long forms stay usable on phones.
 * `onRequestClose` lets forms ask before discarding unsaved changes (DSH-GEN-06).
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  footer,
  onRequestClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  size?: keyof typeof SIZES;
  children: ReactNode;
  footer?: ReactNode;
  onRequestClose?: () => boolean;
}) {
  const t = useTranslations("common");
  const handleOpenChange = (next: boolean) => {
    if (!next && onRequestClose && !onRequestClose()) return;
    onOpenChange(next);
  };
  return (
    <RadixDialog.Root open={open} onOpenChange={handleOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay animate-overlay-in" />
        <RadixDialog.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-sheet shadow-float animate-dialog-in outline-none",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(90dvh,52rem)] sm:w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md",
            SIZES[size],
          )}
        >
          <header className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <RadixDialog.Title className="font-display text-heading font-semibold">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-0.5 text-body text-graphite">{description}</RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label={t("close")}
              className="-me-2 inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-graphite hover:bg-paper hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </RadixDialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? (
            <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-3 sm:flex-row sm:justify-end">{footer}</footer>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

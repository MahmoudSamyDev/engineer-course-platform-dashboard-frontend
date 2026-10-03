import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";

/** Details panel from the inline-end edge (payments, messages). Full screen below 640px. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const t = useTranslations("common");
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 animate-overlay-in bg-overlay" />
        <RadixDialog.Content className="fixed inset-y-0 end-0 z-50 flex w-full animate-sheet-in-end flex-col border-s-[1.5px] border-line-strong bg-sheet shadow-float outline-none sm:w-[30rem]">
          <header className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <RadixDialog.Title className="font-display text-heading font-semibold">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-0.5 text-body text-graphite">
                  {description}
                </RadixDialog.Description>
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
            <footer className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
              {footer}
            </footer>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { useTranslations } from "use-intl";
import type { AdminUser } from "~/domain/admin";
import { BrandBlock } from "./brand-block";
import { LanguageSwitch } from "./language-switch";
import { NavList } from "./nav-list";
import { UserMenu } from "./user-menu";

/** Below 1024px the navigation opens as a drawer from the inline-start edge (DSH-NAV-02). */
export function MobileNav({ user }: { user: AdminUser }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("openMenu")}
        className="-ms-2 inline-flex size-11 items-center justify-center rounded-sm text-ink hover:bg-paper"
      >
        <Menu aria-hidden="true" className="size-6" strokeWidth={1.5} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-overlay-in bg-overlay" />
        <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[min(18rem,85vw)] animate-drawer-in-start flex-col gap-4 border-e-[1.5px] border-line-strong bg-sheet p-4 shadow-float">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <BrandBlock />
            </div>
            <Dialog.Close
              aria-label={t("closeMenu")}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-graphite hover:bg-paper hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">{t("label")}</Dialog.Title>
          <Dialog.Description className="sr-only">{t("label")}</Dialog.Description>
          <nav aria-label={t("label")} className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setOpen(false)} />
          </nav>
          <div className="flex flex-col gap-3 border-t border-line pt-3">
            <LanguageSwitch signedIn className="self-start" />
            <UserMenu user={user} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

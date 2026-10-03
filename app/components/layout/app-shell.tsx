import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import type { AdminUser } from "~/domain/admin";
import { BrandBlock } from "./brand-block";
import { LanguageSwitch } from "./language-switch";
import { MobileNav } from "./mobile-nav";
import { MockBanner } from "./mock-banner";
import { NavList } from "./nav-list";
import { UserMenu } from "./user-menu";

/**
 * Signed-in layout (DSH-NAV-01/02, DESIGN_SYSTEM §7.1):
 * ≥ 1024px a sheet-white navigation rail on the inline-start edge;
 * below, a top bar with the menu button, the product name and the language switch.
 */
export function AppShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const t = useTranslations();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-ink px-3 py-2 text-sheet focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("nav.skipToContent")}
      </a>

      <aside className="fixed inset-y-0 start-0 z-30 hidden w-rail flex-col gap-5 border-e-[1.5px] border-line-strong bg-sheet p-4 lg:flex">
        <BrandBlock />
        <nav aria-label={t("nav.label")} className="flex-1 overflow-y-auto">
          <NavList />
        </nav>
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <LanguageSwitch signedIn className="self-start" />
          <UserMenu user={user} />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:ps-rail">
        <MockBanner />
        <header className="sticky top-0 z-20 flex h-topbar items-center gap-2 border-b border-line bg-sheet px-4 lg:hidden">
          <MobileNav user={user} />
          {/* The page h1 sits right below, so the bar names the product, not the page. */}
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-hidden="true"
              dir="ltr"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-xs bg-cyan-deep font-display text-caption font-bold text-sheet"
            >
              KM
            </span>
            <span className="truncate text-body font-semibold">{t("brand.product")}</span>
          </span>
          <LanguageSwitch signedIn />
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-content flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

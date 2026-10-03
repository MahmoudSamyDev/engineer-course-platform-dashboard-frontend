import { Direction, Tooltip } from "radix-ui";
import type { ReactNode } from "react";
import { IntlProvider } from "use-intl";
import { ToastProvider } from "~/components/ui/toast";
import type { Locale } from "~/domain/types";
import { directionOf, messages, TIME_ZONE } from "~/i18n/config";

/**
 * Cross-cutting providers inside <body>: messages + formats (use-intl, Cairo time),
 * reading direction for Radix primitives (menus, tabs, toggles mirror in RTL), tooltips.
 */
export function AppProviders({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <IntlProvider locale={locale} messages={messages[locale]} timeZone={TIME_ZONE}>
      <Direction.DirectionProvider dir={directionOf(locale)}>
        <Tooltip.Provider delayDuration={300}>
          <ToastProvider>{children}</ToastProvider>
        </Tooltip.Provider>
      </Direction.DirectionProvider>
    </IntlProvider>
  );
}

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "use-intl";
import type { Piasters } from "~/domain/types";
import { appNow } from "~/lib/clock";
import {
  formatAmount,
  formatDate,
  formatDateTime,
  formatShortDateTime,
  formatTime,
} from "~/lib/format";

/** "3,200 EGP" / "3,200 ج.م" with tabular figures (DSH-GEN-09). */
export function Money({ amount, wrap = false }: { amount: Piasters; wrap?: boolean }) {
  const t = useTranslations("common");
  return (
    <span className={wrap ? "tabular" : "whitespace-nowrap tabular"}>
      {t("money", { amount: formatAmount(amount) })}
    </span>
  );
}

export function DateTime({
  iso,
  withTime = true,
  short = false,
  wrap = false,
}: {
  iso: string;
  withTime?: boolean;
  short?: boolean;
  /** Allows the timestamp to break across lines — for narrow cells, not table columns. */
  wrap?: boolean;
}) {
  const locale = useLocale();
  const text = short
    ? formatShortDateTime(iso, locale, appNow())
    : withTime
      ? formatDateTime(iso, locale)
      : formatDate(iso, locale, true);
  return (
    <time
      dateTime={iso}
      title={short ? formatDateTime(iso, locale) : undefined}
      className={wrap ? "tabular" : "whitespace-nowrap tabular"}
    >
      {text}
    </time>
  );
}

export function TimeOnly({ iso }: { iso: string }) {
  const locale = useLocale();
  return (
    <time dateTime={iso} className="whitespace-nowrap tabular">
      {formatTime(iso, locale)}
    </time>
  );
}

/** Latin fragments (codes, references, emails) isolated inside Arabic text. */
export function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** +201012345678 → "+20 101 234 5678". */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+20(\d{3})(\d{3})(\d{4})$/);
  return m ? `+20 ${m[1]} ${m[2]} ${m[3]}` : e164;
}

export function Phone({ e164 }: { e164: string }) {
  return (
    <bdi dir="ltr" className="whitespace-nowrap tabular">
      {formatPhone(e164)}
    </bdi>
  );
}

/** wa.me link for an E.164 number. */
export function whatsappUrl(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}

import { Link } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { DateTime, Ltr, Money } from "~/components/format";
import { PaymentBadge, SessionBadge } from "~/components/status";
import { Panel } from "~/components/ui/panel";
import { SeatBar } from "~/components/ui/seat-bar";
import type { PaymentRow, RegistrationRow, UpcomingSessionSummary } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { formatDateTime } from "~/lib/format";

/** DSH-HOME-04 */
export function LatestPayments({ items }: { items: PaymentRow[] }) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  return (
    <Panel id="latest-payments" title={t("latestPayments")} action={{ to: "/payments", label: tc("viewAll") }}>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-body text-graphite">{t("noPayments")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((p) => (
            <li key={p.id}>
              <Link to={`/payments?payment=${p.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-paper">
                <span className="truncate text-body font-medium text-ink">{p.student.fullName}</span>
                <span className="text-end text-body font-semibold text-ink">
                  <Money amount={p.amount} />
                </span>
                <span className="truncate text-caption text-graphite">
                  <Ltr>{p.course.code}</Ltr> · {formatDateTime(p.createdAt, locale)}
                </span>
                <span className="justify-self-end">
                  <PaymentBadge status={p.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** DSH-HOME-05 */
export function LatestRegistrations({ items }: { items: RegistrationRow[] }) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  return (
    <Panel id="latest-registrations" title={t("latestRegistrations")} action={{ to: "/students", label: tc("viewAll") }}>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-body text-graphite">{t("noRegistrations")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((r) => (
            <li key={r.bookingId}>
              <Link to={`/students/${r.student.id}`} className="flex flex-col gap-0.5 px-4 py-3 hover:bg-paper sm:flex-row sm:items-center sm:gap-4">
                <span className="truncate text-body font-medium text-ink sm:w-56">{r.student.fullName}</span>
                <span className="min-w-0 flex-1 truncate text-caption text-graphite sm:text-body">
                  {r.course.title[locale]} · <Ltr>{r.session.code}</Ltr>
                </span>
                <span className="text-caption text-graphite">
                  <DateTime iso={r.registeredAt} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** DSH-HOME-06 */
export function UpcomingSessions({ items }: { items: UpcomingSessionSummary[] }) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  return (
    <Panel id="upcoming" title={t("upcomingSessions")} action={{ to: "/courses", label: tc("viewAll") }}>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-body text-graphite">{t("noUpcoming")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((s) => (
            <li key={s.id}>
              <Link to={`/courses/${s.courseId}/sessions/${s.id}`} className="flex flex-col gap-2 px-4 py-3 hover:bg-paper">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-body font-medium text-ink">{s.course.title[locale]}</span>
                    <span className="block text-caption text-graphite">
                      {formatDateTime(s.startsAt, locale)} · {s.location[locale]} · <Ltr>{s.code}</Ltr>
                    </span>
                  </span>
                  <SessionBadge status={s.status} />
                </span>
                <SeatBar sold={s.sold} capacity={s.capacity} />
                <span className="sr-only">{tc("seatsOf", { sold: s.sold, capacity: s.capacity })}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

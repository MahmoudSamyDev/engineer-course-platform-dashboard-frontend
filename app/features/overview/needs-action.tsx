import { CalendarClock, CircleCheck, Inbox, ReceiptText, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr } from "~/components/format";
import { Panel } from "~/components/ui/panel";
import type { Overview } from "~/domain/api";
import { formatDateTime } from "~/lib/format";

function Item({
  to,
  icon,
  title,
  detail,
}: {
  to: string;
  icon: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-paper"
      >
        <span className="mt-0.5 text-warning [&_svg]:size-4">{icon}</span>
        <span className="flex min-w-0 flex-col">
          <span className="text-body font-medium text-ink">{title}</span>
          {detail ? <span className="text-caption text-graphite">{detail}</span> : null}
        </span>
      </Link>
    </li>
  );
}

/** Things that need a decision, each with a direct action (DSH-HOME-02). */
export function NeedsAction({ needs }: { needs: Overview["needsAction"] }) {
  const t = useTranslations("home.needs");
  const locale = useLocale();
  const count =
    needs.refundRequired +
    needs.newMessages +
    needs.emptySessionsSoon.length +
    needs.closingSoon.length;

  return (
    <Panel id="needs" title={count > 0 ? t("titleCount", { count }) : t("title")}>
      {count === 0 ? (
        <p className="flex items-center gap-2 px-4 py-6 text-body text-graphite">
          <CircleCheck aria-hidden="true" className="size-4 text-success" />
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {needs.refundRequired > 0 ? (
            <Item
              to="/payments?needsAction=true"
              icon={<ReceiptText />}
              title={t("refunds", { count: needs.refundRequired })}
              detail={t("refundsDetail")}
            />
          ) : null}
          {needs.newMessages > 0 ? (
            <Item
              to="/messages"
              icon={<Inbox />}
              title={t("messages", { count: needs.newMessages })}
              detail={t("messagesDetail")}
            />
          ) : null}
          {needs.emptySessionsSoon.map((s) => (
            <Item
              key={s.id}
              to={`/courses/${s.courseId}/sessions/${s.id}`}
              icon={<UsersRound />}
              title={t("emptySession", { course: s.course.title[locale as "ar" | "en"] })}
              detail={
                <>
                  <Ltr>{s.code}</Ltr> · {formatDateTime(s.startsAt, locale as "ar" | "en")}
                </>
              }
            />
          ))}
          {needs.closingSoon.map((s) => (
            <Item
              key={s.id}
              to={`/courses/${s.courseId}/sessions/${s.id}`}
              icon={<CalendarClock />}
              title={t("closingSoon", {
                course: s.course.title[locale as "ar" | "en"],
                left: s.capacity - s.sold,
              })}
              detail={t("closesAt", { time: formatDateTime(s.closesAt, locale as "ar" | "en") })}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}

import { Lock, LockOpen, Pencil, Printer } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { ExportButton } from "~/components/export-button";
import { DateTime, Ltr, Money } from "~/components/format";
import { PageHeader } from "~/components/layout/page-header";
import { SessionBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { SeatBar } from "~/components/ui/seat-bar";
import { Skeleton } from "~/components/ui/skeleton";
import { TitleBlock, TitleCell } from "~/components/ui/title-block";
import { useToast } from "~/components/ui/toast";
import type { Locale } from "~/domain/types";
import {
  coursesApi,
  useGetCourseQuery,
  useGetSessionQuery,
  useSetSessionClosedMutation,
} from "~/features/courses/api";
import { RosterTable } from "~/features/courses/roster-table";
import { SessionDialog } from "~/features/courses/session-dialog";
import { appNow } from "~/lib/clock";
import { formatDate, formatTime } from "~/lib/format";
import { getApiError } from "~/store/api";
import { store } from "~/store/store";
import type { Route } from "./+types/session";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  store.dispatch(coursesApi.endpoints.getSession.initiate(params.sessionId, { subscribe: false }));
  return null;
}

/** Session page: facts, roster and attendance; printable for the door (SRS §4.7, DUS-18/19). */
export default function Session() {
  const { courseId = "", sessionId = "" } = useParams();
  const t = useTranslations("session");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const { data: session, error, isLoading, refetch } = useGetSessionQuery(sessionId);
  const { data: course } = useGetCourseQuery(courseId, { skip: !courseId });
  const [setClosed, closeState] = useSetSessionClosedMutation();
  const [editing, setEditing] = useState(false);
  const back = { to: `/courses/${courseId}?tab=sessions`, label: tp("course.title") };

  if (isLoading) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }
  if (error && "status" in error && error.status === 404) {
    return (
      <>
        <PageHeader title={tp("session.title")} back={back} />
        <EmptyState
          title={t("notFound")}
          action={
            <Button asChild variant="secondary">
              <Link to={`/courses/${courseId}?tab=sessions`}>{tp("course.title")}</Link>
            </Button>
          }
        />
      </>
    );
  }
  if (error || !session) return <ErrorState error={error} onRetry={refetch} />;

  const first = session.meetings[0]!;
  const last = session.meetings[session.meetings.length - 1]!;
  const attended = session.roster.filter((entry) => entry.attendance.attended > 0).length;
  const started = Date.parse(first.startsAt) <= appNow().getTime();

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={session.course.title[locale]}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <Ltr className="tabular">{session.code}</Ltr>
              <SessionBadge status={session.status} />
              <span>{session.label[locale] || session.label.en}</span>
            </span>
          }
          back={back}
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                {t("list.edit")}
              </Button>
              <Button
                variant="secondary"
                loading={closeState.isLoading}
                onClick={async () => {
                  try {
                    await setClosed({
                      id: session.id,
                      courseId,
                      closed: !session.isClosedManually,
                    }).unwrap();
                    toast({
                      title: session.isClosedManually ? t("list.reopened") : t("list.closed"),
                      description: session.code,
                    });
                  } catch (e) {
                    toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
                  }
                }}
              >
                {session.isClosedManually ? (
                  <LockOpen aria-hidden="true" />
                ) : (
                  <Lock aria-hidden="true" />
                )}
                {session.isClosedManually ? t("list.reopen") : t("list.close")}
              </Button>
              <ExportButton
                path={`/sessions/${session.id}/roster.csv`}
                query=""
                filename={`roster-${session.code}.csv`}
              />
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer aria-hidden="true" />
                {t("print")}
              </Button>
            </>
          }
        />
      </div>

      {/* Print header: the roster is taken to the door on paper (DSH-SES-08). */}
      <header className="hidden print:mb-4 print:block">
        <h1 className="font-display text-title font-semibold">{session.course.title[locale]}</h1>
        <p className="text-body">
          {session.code} · {session.label[locale] || session.label.en} ·{" "}
          {session.location.name[locale]}
        </p>
        <p className="text-caption">
          {t("printedOn")} {formatDate(appNow().toISOString(), locale, true)}
        </p>
      </header>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="print:hidden">
          <TitleBlock>
            <TitleCell
              size="fact"
              label={t("facts.dates")}
              value={`${formatDate(first.startsAt, locale, true)} – ${formatDate(last.endsAt, locale, true)}`}
              note={t("facts.meetingsCount", { count: session.meetings.length })}
            />
            <TitleCell
              size="fact"
              label={t("facts.time")}
              value={`${formatTime(first.startsAt, locale)} – ${formatTime(first.endsAt, locale)}`}
              note={session.location.shortName[locale]}
            />
            <TitleCell
              size="fact"
              label={t("facts.seats")}
              value={<SeatBar sold={session.sold} capacity={session.capacity} />}
              note={session.held > 0 ? t("facts.held", { count: session.held }) : undefined}
            />
            <TitleCell
              size="fact"
              label={t("facts.price")}
              value={<Money amount={session.price} />}
              note={
                <span className="inline-flex flex-wrap gap-x-1">
                  {t("facts.closesAt")} <DateTime iso={session.registrationClosesAt} short />
                </span>
              }
            />
          </TitleBlock>
        </div>

        <section aria-labelledby="roster-title" className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="roster-title" className="font-display text-heading font-semibold">
              {t("roster.title")}
            </h2>
            <p className="text-caption text-graphite print:hidden">
              {started
                ? t("roster.summaryStarted", { total: session.roster.length, attended })
                : t("roster.summary", { total: session.roster.length })}
            </p>
          </div>
          <RosterTable session={session} />
        </section>
      </div>

      {editing && course ? (
        <SessionDialog course={course} session={session} open onOpenChange={setEditing} />
      ) : null}
    </>
  );
}

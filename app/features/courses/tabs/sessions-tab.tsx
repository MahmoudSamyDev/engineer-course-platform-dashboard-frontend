import { CalendarPlus, EyeOff, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr, Money } from "~/components/format";
import { SessionBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { ActionMenu, ActionMenuItem, ActionMenuSeparator } from "~/components/ui/menu";
import { SeatBar } from "~/components/ui/seat-bar";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail, SessionRow } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { formatDate } from "~/lib/format";
import { getApiError } from "~/store/api";
import {
  useDeleteSessionMutation,
  useGetCourseSessionsQuery,
  useSetSessionClosedMutation,
  useUpdateSessionMutation,
} from "../api";
import { SessionDialog } from "../session-dialog";

/** Sessions tab: every run of this course, upcoming first (DSH-SES-01). */
export function SessionsTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("session.list");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const { data, error, isLoading, refetch } = useGetCourseSessionsQuery(course.id);
  const [setClosed] = useSetSessionClosedMutation();
  const [update] = useUpdateSessionMutation();
  const [remove, removeState] = useDeleteSessionMutation();
  const [editing, setEditing] = useState<SessionRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<SessionRow | null>(null);
  const now = appNow().getTime();

  async function run(action: () => Promise<unknown>, title: string, description?: string) {
    try {
      await action();
      toast({ title, description });
    } catch (e) {
      toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-graphite">{t("intro")}</p>
        <Button variant="primary" onClick={() => setEditing("new")}>
          <CalendarPlus aria-hidden="true" />
          {t("add")}
        </Button>
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-sm" />
          ))}
        </div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState
          title={t("empty")}
          description={t("emptyHint")}
          action={
            <Button variant="primary" onClick={() => setEditing("new")}>
              {t("add")}
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((session) => {
            const first = session.meetings[0]!;
            const last = session.meetings[session.meetings.length - 1]!;
            const past = Date.parse(last.endsAt) < now;
            return (
              <li key={session.id} className={past ? "opacity-75" : undefined}>
                <article className="rounded-sm border border-line bg-sheet">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="flex flex-wrap items-center gap-2 text-subheading font-semibold">
                        <Link
                          to={`/courses/${course.id}/sessions/${session.id}`}
                          className="hover:text-cyan hover:underline"
                        >
                          <Ltr>{session.code}</Ltr>
                        </Link>
                        <SessionBadge status={session.status} />
                        {!session.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-xs bg-neutral-wash px-2 py-0.5 text-caption font-medium text-neutral">
                            <EyeOff aria-hidden="true" className="size-3" />
                            {t("unpublished")}
                          </span>
                        ) : null}
                      </h3>
                      <p className="mt-0.5 text-body text-graphite">
                        {session.label[locale] || session.label.en}
                        {session.label[locale] ? " · " : ""}
                        {session.location.shortName[locale]}
                      </p>
                      <p className="mt-1 text-caption text-graphite">
                        {t("dates", {
                          first: formatDate(first.startsAt, locale, true),
                          last: formatDate(last.endsAt, locale, true),
                          count: session.meetings.length,
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-start gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold">
                          <Money amount={session.price} />
                        </span>
                        <SeatBar sold={session.sold} capacity={session.capacity} className="w-40" />
                      </div>
                      <ActionMenu label={`${tc("moreActions")}: ${session.code}`}>
                        <ActionMenuItem onSelect={() => setEditing(session)}>
                          <Pencil aria-hidden="true" />
                          {t("edit")}
                        </ActionMenuItem>
                        <ActionMenuItem
                          onSelect={() =>
                            run(
                              () =>
                                setClosed({
                                  id: session.id,
                                  courseId: course.id,
                                  closed: !session.isClosedManually,
                                }).unwrap(),
                              session.isClosedManually ? t("reopened") : t("closed"),
                              session.code,
                            )
                          }
                        >
                          {session.isClosedManually ? (
                            <LockOpen aria-hidden="true" />
                          ) : (
                            <Lock aria-hidden="true" />
                          )}
                          {session.isClosedManually ? t("reopen") : t("close")}
                        </ActionMenuItem>
                        <ActionMenuItem
                          onSelect={() =>
                            run(
                              () =>
                                update({
                                  id: session.id,
                                  courseId: course.id,
                                  isPublished: !session.isPublished,
                                }).unwrap(),
                              session.isPublished ? t("unpublishedDone") : t("publishedDone"),
                              session.code,
                            )
                          }
                        >
                          <EyeOff aria-hidden="true" />
                          {session.isPublished ? t("unpublish") : t("publish")}
                        </ActionMenuItem>
                        <ActionMenuSeparator />
                        <ActionMenuItem
                          destructive
                          disabled={session.hasBookings}
                          onSelect={() => setDeleting(session)}
                        >
                          <Trash2 aria-hidden="true" />
                          {session.hasBookings ? t("deleteBlocked") : t("delete")}
                        </ActionMenuItem>
                      </ActionMenu>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? (
        <SessionDialog
          course={course}
          session={editing === "new" ? undefined : editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription", { code: deleting?.code ?? "" })}
        confirmLabel={t("delete")}
        destructive
        loading={removeState.isLoading}
        onConfirm={async () => {
          if (!deleting) return;
          await run(
            () => remove({ id: deleting.id, courseId: course.id }).unwrap(),
            t("deleted"),
            deleting.code,
          );
          setDeleting(null);
        }}
      />
    </div>
  );
}

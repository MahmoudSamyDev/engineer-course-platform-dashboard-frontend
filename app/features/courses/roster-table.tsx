import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr, Phone } from "~/components/format";
import { AttendanceLabel, BookingBadge } from "~/components/status";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { EmptyState } from "~/components/ui/empty-state";
import type { MeetingAttendance, RosterEntry, SessionDetail } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { cn } from "~/lib/cn";
import { formatDate, formatTime } from "~/lib/format";
import { getApiError } from "~/store/api";
import { useCheckInMutation, useUndoCheckInMutation } from "./api";
import { useToast } from "~/components/ui/toast";

/** A meeting accepts check-ins from 60 minutes before it starts (DBR-13). */
const CHECK_IN_OPENS_MS = 60 * 60_000;

/**
 * Session roster with one column per meeting (DSH-SES-07, DSH-ATT-01/03):
 * ✓ attended (click to undo), + to mark attended once the meeting has started, — missed.
 */
export function RosterTable({ session }: { session: SessionDetail }) {
  const t = useTranslations("session.roster");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const [checkIn, checkInState] = useCheckInMutation();
  const [undo, undoState] = useUndoCheckInMutation();
  const [undoing, setUndoing] = useState<{ entry: RosterEntry; meeting: MeetingAttendance } | null>(
    null,
  );
  const now = appNow().getTime();

  async function mark(entry: RosterEntry, meeting: MeetingAttendance) {
    try {
      await checkIn({
        sessionId: session.id,
        bookingId: entry.bookingId,
        meetingId: meeting.meetingId,
      }).unwrap();
      toast({ title: t("marked"), description: entry.student.fullName });
    } catch (e) {
      toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
    }
  }

  if (session.roster.length === 0) {
    return <EmptyState title={t("empty")} description={t("emptyHint")} />;
  }

  const cell = (entry: RosterEntry, meeting: MeetingAttendance) => {
    const open = Date.parse(meeting.startsAt) - CHECK_IN_OPENS_MS <= now;
    const canMark = open && entry.status === "PAID";
    if (meeting.checkIn) {
      return (
        <button
          type="button"
          onClick={() => setUndoing({ entry, meeting })}
          title={t("attendedAt", {
            time: formatTime(meeting.checkIn.at, locale),
            by: meeting.checkIn.by,
          })}
          className="inline-flex size-8 items-center justify-center rounded-sm bg-success-wash text-success hover:ring-2 hover:ring-success/40"
        >
          <Check aria-hidden="true" className="size-4" />
          <span className="sr-only">
            {t("undoFor", { name: entry.student.fullName, number: meeting.order })}
          </span>
        </button>
      );
    }
    if (canMark) {
      return (
        <button
          type="button"
          disabled={checkInState.isLoading}
          onClick={() => mark(entry, meeting)}
          className="inline-flex size-8 items-center justify-center rounded-sm border border-dashed border-line-strong text-graphite hover:border-cyan hover:bg-cyan-wash hover:text-cyan"
        >
          <Plus aria-hidden="true" className="size-4" />
          <span className="sr-only">
            {t("markFor", { name: entry.student.fullName, number: meeting.order })}
          </span>
        </button>
      );
    }
    return (
      <span className="inline-flex size-8 items-center justify-center text-concrete">
        <Minus aria-hidden="true" className="size-4" />
        <span className="sr-only">{open ? t("missed") : t("notStarted")}</span>
      </span>
    );
  };

  return (
    <>
      <div className="min-w-0 scroll-x rounded-sm border border-line bg-sheet print:overflow-visible print:border-0 print:contain-none">
        <table className="w-full border-collapse text-body">
          <caption className="sr-only">{t("caption", { code: session.code })}</caption>
          <thead className="bg-paper">
            <tr>
              <th
                scope="col"
                className="h-11 border-b border-line px-3 text-start text-label font-medium text-graphite"
              >
                {t("student")}
              </th>
              <th
                scope="col"
                className="h-11 border-b border-line px-3 text-start text-label font-medium text-graphite"
              >
                {t("reference")}
              </th>
              <th
                scope="col"
                className="h-11 border-b border-line px-3 text-start text-label font-medium text-graphite print:hidden"
              >
                {t("status")}
              </th>
              {session.meetings.map((meeting) => (
                <th
                  key={meeting.id}
                  scope="col"
                  className="h-11 border-b border-line px-2 text-center text-label font-medium whitespace-nowrap text-graphite"
                >
                  <span className="block">{t("meeting", { number: meeting.order })}</span>
                  <span className="block text-caption font-normal">
                    {formatDate(meeting.startsAt, locale)}
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className="hidden h-11 border-b border-line px-3 text-start text-label font-medium text-graphite xl:table-cell print:hidden"
              >
                {t("attendance")}
              </th>
              <th
                scope="col"
                className="hidden h-11 w-32 border-b border-line px-3 text-start text-label font-medium text-graphite print:table-cell"
              >
                {t("signature")}
              </th>
            </tr>
          </thead>
          <tbody>
            {session.roster.map((entry) => (
              <tr
                key={entry.bookingId}
                className={cn(
                  "border-b border-line last:border-0",
                  entry.status !== "PAID" && "bg-paper/60",
                )}
              >
                <td className="px-3 py-2.5">
                  <Link
                    to={`/students/${entry.student.id}`}
                    className="font-medium text-ink hover:text-cyan hover:underline print:no-underline"
                  >
                    {entry.student.fullName}
                  </Link>
                  <div className="text-caption text-graphite">
                    <Phone e164={entry.student.phoneE164} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Ltr className="text-caption whitespace-nowrap text-graphite tabular">
                    {entry.reference}
                  </Ltr>
                </td>
                <td className="px-3 py-2.5 print:hidden">
                  <BookingBadge status={entry.status} />
                </td>
                {entry.meetings.map((meeting) => (
                  <td
                    key={meeting.meetingId}
                    className="px-2 py-2.5 text-center print:border print:border-line"
                  >
                    <span className="print:hidden">{cell(entry, meeting)}</span>
                    <span className="hidden print:inline">{meeting.checkIn ? "✓" : ""}</span>
                  </td>
                ))}
                <td className="hidden px-3 py-2.5 xl:table-cell print:hidden">
                  <AttendanceLabel attendance={entry.attendance} />
                </td>
                <td className="hidden px-3 py-2.5 print:table-cell print:border print:border-line" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(undoing)}
        onOpenChange={(open) => !open && setUndoing(null)}
        title={t("undoTitle")}
        description={t("undoDescription", {
          name: undoing?.entry.student.fullName ?? "",
          number: undoing?.meeting.order ?? 1,
        })}
        confirmLabel={t("undoConfirm")}
        destructive
        loading={undoState.isLoading}
        onConfirm={async () => {
          if (!undoing?.meeting.checkIn) return;
          try {
            await undo({ sessionId: session.id, checkInId: undoing.meeting.checkIn.id }).unwrap();
            toast({ title: t("undone"), description: undoing.entry.student.fullName });
          } catch (e) {
            toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
          }
          setUndoing(null);
        }}
      />
    </>
  );
}

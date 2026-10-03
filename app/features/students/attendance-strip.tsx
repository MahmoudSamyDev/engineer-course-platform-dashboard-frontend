import { Check, Minus } from "lucide-react";
import { useLocale, useTranslations } from "use-intl";
import type { MeetingAttendance } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { cn } from "~/lib/cn";
import { formatDate, formatTime } from "~/lib/format";

/** Meeting-by-meeting attendance (DSH-ATT-01): ✓ attended, — missed, blank for future meetings. */
export function AttendanceStrip({ meetings }: { meetings: MeetingAttendance[] }) {
  const t = useTranslations("attendance");
  const locale = useLocale() as Locale;
  const now = appNow().getTime();
  return (
    <ol className="flex flex-wrap gap-2">
      {meetings.map((m) => {
        const started = Date.parse(m.startsAt) <= now;
        const state = m.checkIn ? "attended" : started ? "missed" : "future";
        return (
          <li
            key={m.meetingId}
            className={cn(
              "flex min-w-24 flex-col gap-0.5 rounded-sm border px-2.5 py-1.5 text-caption",
              state === "attended" && "border-success/30 bg-success-wash",
              state === "missed" && "border-line bg-paper",
              state === "future" && "border-dashed border-line-strong bg-sheet",
            )}
          >
            <span className="font-medium text-ink">{t("meeting", { order: m.order })}</span>
            <span className="tabular text-graphite">{formatDate(m.startsAt, locale)}</span>
            <span className="flex items-center gap-1 font-medium">
              {state === "attended" ? (
                <>
                  <Check aria-hidden="true" className="size-3.5 text-success" />
                  <span className="text-success">
                    {t("attendedAt", { time: formatTime(m.checkIn!.at, locale) })}
                  </span>
                </>
              ) : state === "missed" ? (
                <>
                  <Minus aria-hidden="true" className="size-3.5 text-graphite" />
                  <span className="text-graphite">{t("missed")}</span>
                </>
              ) : (
                <span className="text-graphite">{t("upcoming")}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

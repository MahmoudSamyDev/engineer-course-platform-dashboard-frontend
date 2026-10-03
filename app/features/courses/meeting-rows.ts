import { utcIsoToZonedLocal, zonedLocalToUtcIso } from "~/lib/time";

/** One meeting as typed in the form: Cairo wall-clock date and times. */
export type MeetingRow = { date: string; from: string; to: string };

/**
 * Egypt observes DST, so a weekly repeat must step the *local calendar date* by 7 days and
 * re-convert; adding 7×24h to a UTC instant would shift the wall-clock hour across the
 * October/April transitions (DD-029).
 */
export function addLocalDays(date: string, days: number): string {
  const stepped = new Date(`${date}T12:00:00Z`);
  stepped.setUTCDate(stepped.getUTCDate() + days);
  return stepped.toISOString().slice(0, 10);
}

/** Repeat the first meeting weekly, keeping the same wall-clock time (DSH-SES-02). */
export function repeatWeekly(first: MeetingRow, count: number): MeetingRow[] {
  return Array.from({ length: count }, (_, index) => ({
    ...first,
    date: addLocalDays(first.date, index * 7),
  }));
}

/** Form rows → API meetings (UTC instants). Rows without a date are dropped. */
export function rowsToMeetings(rows: MeetingRow[]): Array<{ startsAt: string; endsAt: string }> {
  return rows
    .filter((row) => row.date && row.from && row.to)
    .map((row) => ({
      startsAt: zonedLocalToUtcIso(`${row.date}T${row.from}`),
      endsAt: zonedLocalToUtcIso(`${row.date}T${row.to}`),
    }));
}

/** API meetings → form rows, back in Cairo wall-clock time. */
export function meetingsToRows(
  meetings: Array<{ startsAt: string; endsAt: string }>,
): MeetingRow[] {
  return meetings.map((meeting) => {
    const start = utcIsoToZonedLocal(meeting.startsAt);
    return {
      date: start.slice(0, 10),
      from: start.slice(11, 16),
      to: utcIsoToZonedLocal(meeting.endsAt).slice(11, 16),
    };
  });
}

/** The default registration close (24 h before the first meeting) as a local datetime input value. */
export function defaultCloseLocal(rows: MeetingRow[]): string {
  const meetings = rowsToMeetings(rows);
  if (meetings.length === 0) return "";
  const first = meetings.map((m) => m.startsAt).sort()[0]!;
  return utcIsoToZonedLocal(new Date(Date.parse(first) - 24 * 3_600_000).toISOString());
}

import { BUSINESS_TIMEZONE } from "~/domain/constants";

export const DATE_RANGES = ["today", "this-week", "this-month", "last-30"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

/** Cairo calendar date "YYYY-MM-DD" of an instant. */
function cairoDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIMEZONE }).format(instant);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Preset → inclusive `from`/`to` dates in Cairo time. The Egyptian week starts on Saturday. */
export function rangeDates(
  range: DateRange | undefined,
  now: Date,
): { from?: string; to?: string } {
  if (!range) return {};
  const today = cairoDate(now);
  switch (range) {
    case "today":
      return { from: today, to: today };
    case "this-week": {
      const weekday = new Date(`${today}T12:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat
      return { from: addDays(today, -((weekday + 1) % 7)), to: today };
    }
    case "this-month":
      return { from: `${today.slice(0, 8)}01`, to: today };
    case "last-30":
      return { from: addDays(today, -29), to: today };
  }
}

export function isDateRange(value: string | undefined): value is DateRange {
  return (DATE_RANGES as readonly string[]).includes(value ?? "");
}

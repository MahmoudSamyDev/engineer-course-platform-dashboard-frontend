import { BUSINESS_TIMEZONE } from "./constants";

/** "YYYY-MM" of an instant in Cairo time (revenue is grouped by Cairo month, SRS §6.3). */
export function cairoMonthKey(instant: Date | string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(instant));
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

/** The `count` month keys ending with the month of `now`, oldest first. */
export function lastMonthKeys(now: Date, count: number): string[] {
  const [y, m] = cairoMonthKey(now).split("-").map(Number) as [number, number];
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const total = y * 12 + (m - 1) - i;
    keys.push(`${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`);
  }
  return keys;
}

import { BUSINESS_TIMEZONE } from "~/domain/constants";

/**
 * Offset of `timeZone` from UTC at the given instant, in minutes (e.g. +180 for UTC+3).
 * Uses the runtime's IANA data, so DST changes (Egypt switches in April/October) are respected.
 * Shared with the Website (src/lib/time.ts) — keep both in sync.
 */
export function timeZoneOffsetMinutes(instant: Date, timeZone: string = BUSINESS_TIMEZONE): number {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(instant)
    .find((p) => p.type === "timeZoneName")?.value;

  // "GMT", "GMT+03:00", "GMT-05:30"
  const match = part?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/**
 * Converts a wall-clock time in the business timezone ("2026-10-17T10:00") to a UTC ISO string.
 * Never use fixed offsets for Cairo (SRS DC-07).
 */
export function zonedLocalToUtcIso(local: string, timeZone: string = BUSINESS_TIMEZONE): string {
  const asIfUtc = Date.parse(`${local}:00.000Z`);
  if (Number.isNaN(asIfUtc)) throw new Error(`Invalid local date-time: ${local}`);

  // First guess with the offset at that instant, then correct once around a DST transition.
  let utc = asIfUtc - timeZoneOffsetMinutes(new Date(asIfUtc), timeZone) * 60_000;
  const corrected = asIfUtc - timeZoneOffsetMinutes(new Date(utc), timeZone) * 60_000;
  if (corrected !== utc) utc = corrected;

  return new Date(utc).toISOString();
}

/** UTC ISO string → wall-clock "YYYY-MM-DDTHH:mm" in the business timezone (for date/time inputs). */
export function utcIsoToZonedLocal(iso: string, timeZone: string = BUSINESS_TIMEZONE): string {
  const instant = new Date(iso);
  const shifted = new Date(instant.getTime() + timeZoneOffsetMinutes(instant, timeZone) * 60_000);
  return shifted.toISOString().slice(0, 16);
}

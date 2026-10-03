import { cairoMonthKey } from "./months";
import { REGISTRATION_CUTOFF_HOURS } from "./constants";

export type MeetingTimes = { startsAt: string; endsAt: string };

export type MeetingProblem =
  | { kind: "none" }
  | { kind: "endBeforeStart"; index: number }
  | { kind: "overlap"; index: number }
  | { kind: "firstInPast" };

/** DBR-08 — at least one meeting, end after start, no overlaps, first one in the future (on create). */
export function checkMeetings(meetings: MeetingTimes[], now: Date, isNew: boolean): MeetingProblem {
  const sorted = meetings
    .map((m, index) => ({ ...m, index, start: Date.parse(m.startsAt), end: Date.parse(m.endsAt) }))
    .sort((a, b) => a.start - b.start);
  for (const m of sorted) {
    if (!(m.end > m.start)) return { kind: "endBeforeStart", index: m.index };
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.start < sorted[i - 1]!.end) return { kind: "overlap", index: sorted[i]!.index };
  }
  if (isNew && sorted.length && sorted[0]!.start <= now.getTime()) return { kind: "firstInPast" };
  return { kind: "none" };
}

/** DBR-07 — default registration cut-off: 24 h before the first meeting. */
export function defaultRegistrationClose(firstStartIso: string): string {
  return new Date(Date.parse(firstStartIso) - REGISTRATION_CUTOFF_HOURS * 3_600_000).toISOString();
}

/** DBR-10 — `{COURSE3}-{YYMM}-{A..Z}` with the next free letter for that course and month. */
export function nextSessionCode(
  courseCode: string,
  firstStartIso: string,
  existingCodes: string[],
): string {
  const [year, month] = cairoMonthKey(firstStartIso).split("-") as [string, string];
  const prefix = `${courseCode}-${year.slice(2)}${month}-`;
  const used = new Set(
    existingCodes.filter((c) => c.startsWith(prefix)).map((c) => c.slice(prefix.length)),
  );
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return prefix + letter;
  }
  throw new Error(`No free session code for ${prefix}`);
}

/** DBR-05 — capacity can't go below sold + held seats. */
export function minimumCapacity(sold: number, held: number): number {
  return Math.max(1, sold + held);
}

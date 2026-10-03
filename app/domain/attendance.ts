import type { Attendance, MeetingAttendance } from "./api";
import type { BookingStatus } from "./types";

/**
 * DSH-ATT-02 — attendance status of one registration at `now`.
 * Only PAID registrations have attendance; a meeting counts as "past" once it has started.
 */
export function attendanceOf(
  status: BookingStatus,
  meetings: Pick<MeetingAttendance, "startsAt" | "endsAt" | "checkIn">[],
  now: Date,
): Attendance {
  const total = meetings.length;
  const attended = meetings.filter((m) => m.checkIn).length;
  if (status !== "PAID" || total === 0) return { status: "NONE", attended, total };

  const started = meetings.filter((m) => new Date(m.startsAt) <= now).length;
  const ended = new Date(meetings[total - 1]!.endsAt) <= now;

  if (started === 0) return { status: "UPCOMING", attended, total };
  if (ended) return { status: "COMPLETED", attended, total };
  return { status: attended > 0 ? "ATTENDED" : "ABSENT", attended, total };
}

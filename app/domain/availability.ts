import {
  ALMOST_FULL_MIN_SEATS,
  ALMOST_FULL_RATIO,
  SHOW_EXACT_SEATS_AT_OR_BELOW,
} from "./constants";
import type { Course, CourseStatus, Session, SessionAvailability, SessionStatus } from "./types";

/** BR-08: remaining seats = capacity − paid bookings − active holds (never negative). */
export function remainingSeats(
  session: Pick<Session, "capacity" | "paidCount" | "activeHolds">,
): number {
  return Math.max(0, session.capacity - session.paidCount - session.activeHolds);
}

/** BR-12: almost-full threshold = max(3, 20% of capacity). */
export function almostFullThreshold(capacity: number): number {
  return Math.max(ALMOST_FULL_MIN_SEATS, Math.floor(capacity * ALMOST_FULL_RATIO));
}

export function firstMeetingStart(session: Pick<Session, "meetings">): Date {
  return new Date(session.meetings[0].startsAt);
}

export function lastMeetingEnd(session: Pick<Session, "meetings">): Date {
  return new Date(session.meetings[session.meetings.length - 1].endsAt);
}

/** BR-07, BR-11, BR-12, BR-14: the computed status of one session at `now`. */
export function getSessionAvailability(session: Session, now: Date): SessionAvailability {
  const remaining = remainingSeats(session);
  const registrationClosed =
    session.isClosedManually ||
    !session.isPublished ||
    now >= new Date(session.registrationClosesAt) ||
    now >= firstMeetingStart(session);

  let status: SessionStatus;
  if (registrationClosed) status = "CLOSED";
  else if (remaining === 0) status = "FULLY_BOOKED";
  else if (remaining <= almostFullThreshold(session.capacity)) status = "ALMOST_FULL";
  else status = "AVAILABLE";

  const isBookable = status === "AVAILABLE" || status === "ALMOST_FULL";

  return {
    status,
    remainingSeats: remaining,
    displaySeats: isBookable && remaining <= SHOW_EXACT_SEATS_AT_OR_BELOW ? remaining : null,
    isBookable,
  };
}

/** Sessions still worth showing to students: not yet ended. Sorted by first meeting. */
export function upcomingSessions(sessions: Session[], now: Date): Session[] {
  return sessions
    .filter((s) => s.isPublished && lastMeetingEnd(s) > now)
    .sort((a, b) => firstMeetingStart(a).getTime() - firstMeetingStart(b).getTime());
}

const SESSION_STATUS_RANK: Record<SessionStatus, number> = {
  AVAILABLE: 0,
  ALMOST_FULL: 1,
  FULLY_BOOKED: 2,
  CLOSED: 3,
};

/**
 * BR-13: course status.
 * Coming soon → no open sessions and flagged; Closed → manually closed or nothing upcoming;
 * otherwise the best status among upcoming sessions.
 */
export function getCourseStatus(course: Course, sessions: Session[], now: Date): CourseStatus {
  if (course.registrationClosed) return "CLOSED";

  const upcoming = upcomingSessions(sessions, now);
  const statuses = upcoming.map((s) => getSessionAvailability(s, now).status);
  const hasOpen = statuses.some(
    (s) => s === "AVAILABLE" || s === "ALMOST_FULL" || s === "FULLY_BOOKED",
  );

  if (!hasOpen) return course.isComingSoon ? "COMING_SOON" : "CLOSED";

  const best = statuses.reduce((a, b) =>
    SESSION_STATUS_RANK[a] <= SESSION_STATUS_RANK[b] ? a : b,
  );
  return best === "CLOSED" ? "CLOSED" : best;
}

/** The nearest session a student can book, if any. */
export function nextBookableSession(sessions: Session[], now: Date): Session | undefined {
  return upcomingSessions(sessions, now).find((s) => getSessionAvailability(s, now).isBookable);
}

/** The nearest upcoming session regardless of availability (for "next session" display). */
export function nextUpcomingSession(sessions: Session[], now: Date): Session | undefined {
  return upcomingSessions(sessions, now).find((s) => firstMeetingStart(s) > now);
}

const COURSE_STATUS_GROUP: Record<CourseStatus, number> = {
  AVAILABLE: 0,
  ALMOST_FULL: 0,
  FULLY_BOOKED: 1,
  COMING_SOON: 2,
  CLOSED: 3,
};

export type CourseWithStatus = {
  course: Course;
  status: CourseStatus;
  nextBookable?: Session;
};

/**
 * FR-CRS-01: bookable courses first (by nearest bookable session), then fully booked,
 * then coming soon, then closed. Ties fall back to the course sort order.
 */
export function sortCatalog(items: CourseWithStatus[]): CourseWithStatus[] {
  return [...items].sort((a, b) => {
    const group = COURSE_STATUS_GROUP[a.status] - COURSE_STATUS_GROUP[b.status];
    if (group !== 0) return group;
    const aTime = a.nextBookable
      ? firstMeetingStart(a.nextBookable).getTime()
      : Number.POSITIVE_INFINITY;
    const bTime = b.nextBookable
      ? firstMeetingStart(b.nextBookable).getTime()
      : Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return a.course.sortOrder - b.course.sortOrder;
  });
}

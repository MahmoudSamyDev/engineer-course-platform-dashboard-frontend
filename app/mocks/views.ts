/**
 * Builds admin API payloads (SRS §7.2) from mock records, reusing the shared domain rules
 * (Website BR-08/12/13 in ~/domain/availability, attendance DSH-ATT-02). The real backend
 * computes the same values from the database.
 */
import type {
  CourseCard,
  CourseDetail,
  CourseRef,
  MeetingAttendance,
  Overview,
  PaymentDetail,
  PaymentRow,
  RegistrationRow,
  RosterEntry,
  SessionDetail,
  SessionRef,
  SessionRow,
  StudentDetail,
  StudentRef,
  StudentRegistration,
  UpcomingSessionSummary,
} from "~/domain/api";
import { attendanceOf } from "~/domain/attendance";
import { getCourseStatus, getSessionAvailability, upcomingSessions } from "~/domain/availability";
import { readinessIssues } from "~/domain/course-rules";
import { cairoMonthKey, lastMonthKeys } from "~/domain/months";
import type { Session, TicketStatus } from "~/domain/types";
import { db, mockNow, type MockBooking, type MockCourse, type MockPayment, type MockSession } from "./db";

const COUNTED_SEAT: MockBooking["status"][] = ["PAID"];

export function findCourse(id: string) {
  return db.courses.find((c) => c.id === id);
}
export function findSession(id: string) {
  return db.sessions.find((s) => s.id === id);
}
function findStudent(id: string) {
  return db.students.find((s) => s.id === id)!;
}

export function soldSeats(sessionId: string): number {
  return db.bookings.filter((b) => b.sessionId === sessionId && COUNTED_SEAT.includes(b.status)).length;
}

export function heldSeats(sessionId: string, now = mockNow()): number {
  return db.bookings.filter(
    (b) =>
      b.sessionId === sessionId &&
      b.status === "PENDING_PAYMENT" &&
      b.holdExpiresAt !== null &&
      Date.parse(b.holdExpiresAt) > now.getTime(),
  ).length;
}

/** Mock session → the shared `Session` shape the availability rules expect. */
export function asDomainSession(session: MockSession, now = mockNow()): Session {
  return {
    ...session,
    paidCount: soldSeats(session.id),
    activeHolds: heldSeats(session.id, now),
  };
}

export function courseState(course: MockCourse) {
  return course.archivedAt ? "ARCHIVED" : course.isPublished ? "PUBLISHED" : "DRAFT";
}

export function courseStatus(course: MockCourse, now = mockNow()) {
  const sessions = db.sessions.filter((s) => s.courseId === course.id).map((s) => asDomainSession(s, now));
  return getCourseStatus(course, sessions, now);
}

const courseRef = (course: MockCourse): CourseRef => ({ id: course.id, code: course.code, title: course.title });
const sessionRef = (session: MockSession): SessionRef => ({ id: session.id, code: session.code, label: session.label });

function studentRef(studentId: string): StudentRef {
  const student = findStudent(studentId);
  const department = db.departments.find((d) => d.code === student.departmentCode)!;
  return {
    id: student.id,
    fullName: student.fullName,
    phoneE164: student.phoneE164,
    email: student.email,
    department: department.name,
  };
}

function meetingAttendance(booking: MockBooking, session: MockSession): MeetingAttendance[] {
  return session.meetings.map((meeting) => {
    const checkIn = db.checkIns.find((c) => c.bookingId === booking.id && c.meetingId === meeting.id);
    return {
      meetingId: meeting.id,
      order: meeting.order,
      startsAt: meeting.startsAt,
      endsAt: meeting.endsAt,
      checkIn: checkIn ? { id: checkIn.id, at: checkIn.at, by: checkIn.by, source: checkIn.source } : null,
    };
  });
}

/** Website §6.3 ticket state machine, derived. */
function ticketStatus(booking: MockBooking, session: MockSession, meetings: MeetingAttendance[], now: Date): TicketStatus | null {
  if (booking.status === "CANCELLED" || booking.status === "REFUNDED") return "CANCELLED";
  if (booking.status !== "PAID") return null;
  const lastEnd = Date.parse(session.meetings[session.meetings.length - 1]!.endsAt);
  const checked = meetings.some((m) => m.checkIn);
  if (now.getTime() > lastEnd) return checked ? "USED" : now.getTime() > lastEnd + 24 * 3_600_000 ? "EXPIRED" : "VALID";
  return checked ? "CHECKED_IN" : "VALID";
}

export function registrationRow(booking: MockBooking, now = mockNow()): RegistrationRow {
  const session = findSession(booking.sessionId)!;
  const course = findCourse(session.courseId)!;
  const meetings = meetingAttendance(booking, session);
  return {
    bookingId: booking.id,
    reference: booking.reference,
    status: booking.status,
    registeredAt: booking.paidAt ?? booking.createdAt,
    student: studentRef(booking.studentId),
    course: courseRef(course),
    session: sessionRef(session),
    attendance: attendanceOf(booking.status, meetings, now),
    ticketStatus: ticketStatus(booking, session, meetings, now),
  };
}

export function paymentRow(payment: MockPayment): PaymentRow {
  const booking = db.bookings.find((b) => b.id === payment.bookingId)!;
  const session = findSession(booking.sessionId)!;
  const course = findCourse(session.courseId)!;
  const student = findStudent(booking.studentId);
  return {
    id: payment.id,
    bookingId: booking.id,
    reference: booking.reference,
    createdAt: payment.createdAt,
    processedAt: payment.processedAt,
    student: { id: student.id, fullName: student.fullName, phoneE164: student.phoneE164 },
    course: courseRef(course),
    session: sessionRef(session),
    method: payment.method,
    amount: payment.amount,
    refundedAmount: payment.refundedAmount,
    status: payment.status,
    bookingStatus: booking.status,
    providerTransactionId: payment.providerTransactionId,
  };
}

export function paymentDetail(payment: MockPayment): PaymentDetail {
  const booking = db.bookings.find((b) => b.id === payment.bookingId)!;
  return {
    ...paymentRow(payment),
    studentEmail: findStudent(booking.studentId).email,
    providerOrderId: payment.providerOrderId,
    refundTransactionId: payment.refundTransactionId,
    refundNote: payment.refundNote,
    timeline: [...payment.timeline].sort((a, b) => a.at.localeCompare(b.at)),
  };
}

export function studentDetail(studentId: string, now = mockNow()): StudentDetail {
  const student = findStudent(studentId);
  const own = db.bookings.filter((b) => b.studentId === studentId && b.status !== "PENDING_PAYMENT" && b.status !== "EXPIRED");
  const registrations: StudentRegistration[] = own
    .map((booking) => {
      const session = findSession(booking.sessionId)!;
      const location = db.locations.find((l) => l.id === session.locationId)!;
      return {
        ...registrationRow(booking, now),
        amount: booking.amount,
        location: location.name,
        meetings: meetingAttendance(booking, session),
      };
    })
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  const bookingIds = new Set(db.bookings.filter((b) => b.studentId === studentId).map((b) => b.id));
  const firstBooking = db.bookings
    .filter((b) => b.studentId === studentId)
    .reduce((first, b) => (b.createdAt < first ? b.createdAt : first), student.createdAt);
  return {
    ...studentRef(studentId),
    consentAt: firstBooking,
    createdAt: firstBooking,
    registrations,
    payments: db.payments
      .filter((p) => bookingIds.has(p.bookingId))
      .map(paymentRow)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export function sessionRow(session: MockSession, now = mockNow()): SessionRow {
  const domain = asDomainSession(session, now);
  const location = db.locations.find((l) => l.id === session.locationId)!;
  return {
    id: session.id,
    code: session.code,
    courseId: session.courseId,
    label: session.label,
    location: { id: location.id, name: location.name, shortName: location.shortName },
    capacity: session.capacity,
    sold: domain.paidCount,
    held: domain.activeHolds,
    price: session.price,
    meetings: session.meetings,
    registrationClosesAt: session.registrationClosesAt,
    status: getSessionAvailability(domain, now).status,
    isPublished: session.isPublished,
    isClosedManually: session.isClosedManually,
    hasBookings: db.bookings.some((b) => b.sessionId === session.id),
  };
}

export function sessionDetail(session: MockSession, now = mockNow()): SessionDetail {
  const course = findCourse(session.courseId)!;
  const roster: RosterEntry[] = db.bookings
    .filter((b) => b.sessionId === session.id && ["PAID", "REFUND_REQUIRED", "CANCELLED", "REFUNDED"].includes(b.status))
    .map((booking) => {
      const row = registrationRow(booking, now);
      return {
        bookingId: booking.id,
        reference: booking.reference,
        status: booking.status,
        ticketStatus: row.ticketStatus,
        student: row.student,
        attendance: row.attendance,
        meetings: meetingAttendance(booking, session),
      };
    })
    .sort((a, b) => a.student.fullName.localeCompare(b.student.fullName));
  return { ...sessionRow(session, now), course: { ...courseRef(course), basePrice: course.basePrice }, roster };
}

export function courseCard(course: MockCourse, now = mockNow()): CourseCard {
  const sessions = db.sessions.filter((s) => s.courseId === course.id).map((s) => asDomainSession(s, now));
  const upcoming = upcomingSessions(sessions, now).filter((s) => Date.parse(s.meetings[0]!.startsAt) > now.getTime());
  const next = upcoming[0];
  return {
    id: course.id,
    slug: course.slug,
    code: course.code,
    title: course.title,
    coverDiscipline: course.coverDiscipline,
    state: courseState(course),
    status: courseStatus(course, now),
    basePrice: course.basePrice,
    nextSession: next
      ? { id: next.id, code: next.code, startsAt: next.meetings[0]!.startsAt, sold: next.paidCount, capacity: next.capacity }
      : null,
    upcomingSessionsCount: upcoming.length,
    sortOrder: course.sortOrder,
  };
}

export function courseDetail(course: MockCourse, now = mockNow()): CourseDetail {
  const sessionIds = new Set(db.sessions.filter((s) => s.courseId === course.id).map((s) => s.id));
  const hasBookings = db.bookings.some((b) => sessionIds.has(b.sessionId));
  const modules = course.modules.map((m) => ({
    title: m.title,
    durationHours: m.durationHours,
    topics: m.topics ?? { ar: [], en: [] },
  }));
  const detail = {
    id: course.id,
    slug: course.slug,
    code: course.code,
    codeLocked: sessionIds.size > 0,
    slugLocked: course.isPublished || course.archivedAt !== null || hasBookings,
    title: course.title,
    shortDescription: course.shortDescription,
    about: course.about,
    audience: course.audience,
    problemSolved: course.problemSolved,
    expectations: course.expectations,
    outcomes: course.outcomes,
    requirements: course.requirements,
    whatToBring: course.whatToBring,
    modules,
    faq: course.faq,
    level: course.level,
    totalHours: course.totalHours,
    meetingsCount: course.meetingsCount,
    basePrice: course.basePrice,
    coverDiscipline: course.coverDiscipline,
    coverAlt: course.coverAlt,
    state: courseState(course),
    status: courseStatus(course, now),
    isFeatured: course.isFeatured,
    isComingSoon: course.isComingSoon,
    comingSoonNote: course.comingSoonNote,
    registrationClosed: course.registrationClosed,
    seo: course.seo,
    hasSessions: sessionIds.size > 0,
    hasBookings,
  } satisfies Omit<CourseDetail, "readiness">;
  return { ...detail, readiness: readinessIssues(detail) };
}

function upcomingSummary(session: MockSession, now: Date): UpcomingSessionSummary {
  const course = findCourse(session.courseId)!;
  const row = sessionRow(session, now);
  return {
    id: session.id,
    courseId: course.id,
    code: session.code,
    course: courseRef(course),
    location: row.location.shortName,
    startsAt: session.meetings[0]!.startsAt,
    sold: row.sold,
    capacity: row.capacity,
    status: row.status,
  };
}

const netOf = (p: MockPayment) => (p.status === "SUCCEEDED" || p.status === "REFUNDED" ? p.amount - p.refundedAmount : 0);

export function overview(now = mockNow()): Overview {
  const nowMs = now.getTime();
  const [lastMonth, thisMonth] = lastMonthKeys(now, 2) as [string, string];
  const months = lastMonthKeys(now, 6);
  const settled = db.payments.filter((p) => p.processedAt && (p.status === "SUCCEEDED" || p.status === "REFUNDED"));
  const revenueIn = (month: string) =>
    settled.filter((p) => cairoMonthKey(p.processedAt!) === month).reduce((sum, p) => sum + netOf(p), 0);
  const paidIn = (month: string) =>
    db.bookings.filter((b) => b.status === "PAID" && b.paidAt && cairoMonthKey(b.paidAt) === month).length;

  const live = db.sessions
    .filter((s) => s.isPublished && findCourse(s.courseId)?.archivedAt === null)
    .filter((s) => Date.parse(s.meetings[0]!.startsAt) > nowMs)
    .sort((a, b) => a.meetings[0]!.startsAt.localeCompare(b.meetings[0]!.startsAt));
  const next30 = live.filter((s) => Date.parse(s.meetings[0]!.startsAt) <= nowMs + 30 * 86_400_000);
  const summaries = live.map((s) => upcomingSummary(s, now));

  return {
    kpis: {
      revenueThisMonth: revenueIn(thisMonth),
      revenueLastMonth: revenueIn(lastMonth),
      paidThisMonth: paidIn(thisMonth),
      paidLastMonth: paidIn(lastMonth),
      seatsSold: summaries.reduce((sum, s) => sum + s.sold, 0),
      seatsCapacity: summaries.reduce((sum, s) => sum + s.capacity, 0),
      upcomingSessions: next30.length,
    },
    needsAction: {
      refundRequired: db.bookings.filter((b) => b.status === "REFUND_REQUIRED").length,
      newMessages: db.messages.filter((m) => m.status === "NEW").length,
      emptySessionsSoon: summaries.filter((s) => s.sold === 0 && Date.parse(s.startsAt) <= nowMs + 7 * 86_400_000),
      closingSoon: live
        .filter((s) => {
          const closes = Date.parse(s.registrationClosesAt);
          return closes > nowMs && closes <= nowMs + 48 * 3_600_000 && !s.isClosedManually;
        })
        .map((s) => ({ ...upcomingSummary(s, now), closesAt: s.registrationClosesAt }))
        .filter((s) => s.sold < s.capacity),
    },
    revenueByMonth: months.map((month) => ({ month, amount: revenueIn(month) })),
    upcomingSessions: summaries.slice(0, 5),
    latestPayments: [...db.payments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map(paymentRow),
    latestRegistrations: db.bookings
      .filter((b) => b.status === "PAID" && b.paidAt)
      .sort((a, b) => b.paidAt!.localeCompare(a.paidAt!))
      .slice(0, 5)
      .map((b) => registrationRow(b, now)),
    hasCourses: db.courses.some((c) => c.archivedAt === null),
  };
}

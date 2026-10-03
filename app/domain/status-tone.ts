import type { AttendanceStatus, CoursePublicationState, MessageStatus, PaymentStatus } from "./api";
import type { BookingStatus, CourseStatus, SessionStatus, TicketStatus } from "./types";

export type Tone = "success" | "warning" | "danger" | "neutral" | "info";

/** DESIGN_SYSTEM §3 — one place maps every status to a badge tone (label always accompanies it). */
export const BOOKING_TONE: Record<BookingStatus, Tone> = {
  PAID: "success",
  PENDING_PAYMENT: "warning",
  REFUND_REQUIRED: "warning",
  EXPIRED: "neutral",
  CANCELLED: "neutral",
  REFUNDED: "info",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  SUCCEEDED: "success",
  INITIATED: "warning",
  FAILED: "danger",
  REFUNDED: "info",
};

export const SESSION_TONE: Record<SessionStatus, Tone> = {
  AVAILABLE: "success",
  ALMOST_FULL: "warning",
  FULLY_BOOKED: "danger",
  CLOSED: "neutral",
};

export const COURSE_TONE: Record<CourseStatus, Tone> = {
  AVAILABLE: "success",
  ALMOST_FULL: "warning",
  FULLY_BOOKED: "danger",
  COMING_SOON: "info",
  CLOSED: "neutral",
};

export const PUBLICATION_TONE: Record<CoursePublicationState, Tone> = {
  PUBLISHED: "success",
  DRAFT: "neutral",
  ARCHIVED: "neutral",
};

export const ATTENDANCE_TONE: Record<AttendanceStatus, Tone> = {
  UPCOMING: "info",
  ATTENDED: "success",
  ABSENT: "danger",
  COMPLETED: "neutral",
  NONE: "neutral",
};

export const TICKET_TONE: Record<TicketStatus, Tone> = {
  VALID: "success",
  CHECKED_IN: "info",
  USED: "neutral",
  EXPIRED: "neutral",
  CANCELLED: "neutral",
};

export const MESSAGE_TONE: Record<MessageStatus, Tone> = {
  NEW: "warning",
  READ: "neutral",
  ARCHIVED: "neutral",
};

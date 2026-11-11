/**
 * Which money actions a booking allows (DBR-11, DBR-12, DSH-PAY-05…07). Shared by the
 * payment sheet (which buttons to show) and the mock API (what to accept), so they can't
 * drift apart. The real API enforces the same rules (DNFR-SEC-02).
 */
import type { PaymentStatus } from "./api";
import type { BookingStatus } from "./types";

/**
 * DBR-11: a refund needs a SUCCEEDED payment. The booking may be Paid, Refund required, or
 * Cancelled — a cancellation releases the seat but the money is refunded in Paymob later
 * (DSH-PAY-07), and that refund must still be recordable (DD-050).
 */
export function canRecordRefund(payment: PaymentStatus, booking: BookingStatus): boolean {
  return (
    payment === "SUCCEEDED" &&
    (booking === "PAID" || booking === "REFUND_REQUIRED" || booking === "CANCELLED")
  );
}

/** DBR-12: only a refund-required booking is moved (or accepted into its own session). */
export function canMoveBooking(booking: BookingStatus): boolean {
  return booking === "REFUND_REQUIRED";
}

/** DSH-PAY-07: cancel a paid booking whose payment went through. */
export function canCancelBooking(payment: PaymentStatus, booking: BookingStatus): boolean {
  return payment === "SUCCEEDED" && booking === "PAID";
}

export type MoveTarget = {
  courseId: string;
  isPublished: boolean;
  isClosedManually: boolean;
  /** First meeting start (ISO). A session that has started can't take new students. */
  firstStartsAt: string;
  remainingSeats: number;
};

export type MoveProblem = "OTHER_COURSE" | "NOT_OPEN" | "STARTED" | "NO_SEATS";

/**
 * DBR-12 target rule (DD-051): same course, published and not closed by hand, not started,
 * at least one free seat. The booking's own session counts too when a seat has freed up
 * (Website §6.3 REFUND_REQUIRED → PAID "approved by admin"). The registration cut-off does
 * not apply: the owner is deciding, not a student booking online.
 */
export function moveTargetProblem(
  target: MoveTarget,
  courseId: string,
  now: Date,
): MoveProblem | null {
  if (target.courseId !== courseId) return "OTHER_COURSE";
  if (!target.isPublished || target.isClosedManually) return "NOT_OPEN";
  if (Date.parse(target.firstStartsAt) <= now.getTime()) return "STARTED";
  if (target.remainingSeats < 1) return "NO_SEATS";
  return null;
}

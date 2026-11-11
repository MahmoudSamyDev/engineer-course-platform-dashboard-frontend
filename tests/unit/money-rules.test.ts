import { describe, expect, it } from "vitest";
import {
  canCancelBooking,
  canMoveBooking,
  canRecordRefund,
  moveTargetProblem,
  type MoveTarget,
} from "~/domain/money-rules";

const now = new Date("2026-11-11T10:00:00Z");
const open: MoveTarget = {
  courseId: "C4",
  isPublished: true,
  isClosedManually: false,
  firstStartsAt: "2026-12-01T14:00:00Z",
  remainingSeats: 1,
};

describe("money action rules (DBR-11, DBR-12, DSH-PAY-05…07)", () => {
  it("records a refund for a succeeded payment on a paid, refund-required or cancelled booking", () => {
    expect(canRecordRefund("SUCCEEDED", "PAID")).toBe(true);
    expect(canRecordRefund("SUCCEEDED", "REFUND_REQUIRED")).toBe(true);
    expect(canRecordRefund("SUCCEEDED", "CANCELLED")).toBe(true); // DD-050
    expect(canRecordRefund("REFUNDED", "REFUNDED")).toBe(false);
    expect(canRecordRefund("FAILED", "EXPIRED")).toBe(false);
  });

  it("moves only refund-required bookings and cancels only paid ones", () => {
    expect(canMoveBooking("REFUND_REQUIRED")).toBe(true);
    expect(canMoveBooking("PAID")).toBe(false);
    expect(canCancelBooking("SUCCEEDED", "PAID")).toBe(true);
    expect(canCancelBooking("SUCCEEDED", "CANCELLED")).toBe(false);
  });

  it("accepts an open, future session of the same course with a free seat", () => {
    expect(moveTargetProblem(open, "C4", now)).toBeNull();
    expect(moveTargetProblem(open, "C1", now)).toBe("OTHER_COURSE");
    expect(moveTargetProblem({ ...open, isPublished: false }, "C4", now)).toBe("NOT_OPEN");
    expect(moveTargetProblem({ ...open, isClosedManually: true }, "C4", now)).toBe("NOT_OPEN");
    expect(moveTargetProblem({ ...open, firstStartsAt: "2026-11-10T14:00:00Z" }, "C4", now)).toBe(
      "STARTED",
    );
    expect(moveTargetProblem({ ...open, remainingSeats: 0 }, "C4", now)).toBe("NO_SEATS");
  });
});

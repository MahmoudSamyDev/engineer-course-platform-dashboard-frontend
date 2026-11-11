import { http } from "msw";
import type { PaymentMethod, PaymentRow, PaymentStatus, PaymentSummary } from "~/domain/api";
import { MOCK_API } from "../config";
import { db, mockNow } from "../db";
import { apiError, currentAdmin, latency } from "../http";
import { asDomainSession, findCourse, findSession, paymentDetail, paymentRow } from "../views";
import { getSessionAvailability } from "~/domain/availability";
import {
  csvResponse,
  idempotent,
  inRange,
  itemResponse,
  listResponse,
  matchesQuery,
  sortBy,
} from "./helpers";
import {
  canCancelBooking,
  canMoveBooking,
  canRecordRefund,
  moveTargetProblem,
} from "~/domain/money-rules";

function filteredPayments(url: URL): PaymentRow[] {
  const p = url.searchParams;
  const rows = db.payments
    .map(paymentRow)
    .filter((r) => !p.get("status") || r.status === (p.get("status") as PaymentStatus))
    .filter((r) => !p.get("method") || r.method === (p.get("method") as PaymentMethod))
    .filter((r) => !p.get("courseId") || r.course.id === p.get("courseId"))
    .filter((r) => p.get("needsAction") !== "true" || r.bookingStatus === "REFUND_REQUIRED")
    .filter((r) => inRange(r.createdAt, p.get("from"), p.get("to")))
    .filter((r) => {
      if (!p.get("q")) return true;
      const student = db.students.find((s) => s.id === r.student.id)!;
      return matchesQuery(
        p.get("q"),
        r.reference,
        r.providerTransactionId,
        student.phoneE164,
        student.email,
        student.fullName,
      );
    });
  return sortBy(
    rows,
    p.get("sort"),
    { createdAt: (r) => r.createdAt, amount: (r) => r.amount },
    "-createdAt",
  );
}

function summaryOf(rows: PaymentRow[]): PaymentSummary {
  const settled = rows.filter((r) => r.status === "SUCCEEDED" || r.status === "REFUNDED");
  const gross = settled.reduce((sum, r) => sum + r.amount, 0);
  const refunded = settled.reduce((sum, r) => sum + r.refundedAmount, 0);
  return { gross, refunded, net: gross - refunded, count: rows.length };
}

const by = () => currentAdmin()?.name ?? "Admin";

/** SRS §7.2 — payments, refund, move, cancel, CSV (DSH-PAY-*, DBR-11/12). */
export const paymentHandlers = [
  http.get(`${MOCK_API}/payments`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const rows = filteredPayments(url);
    return listResponse(rows, url, { summary: summaryOf(rows) });
  }),

  http.get(`${MOCK_API}/payments/export.csv`, async ({ request }) => {
    await latency();
    const rows = filteredPayments(new URL(request.url)).slice(0, 10_000);
    return csvResponse(
      "payments.csv",
      [
        "created_at_utc",
        "reference",
        "student",
        "course",
        "session",
        "method",
        "amount_egp",
        "refunded_egp",
        "status",
        "booking_status",
        "transaction_id",
      ],
      rows.map((r) => [
        r.createdAt,
        r.reference,
        r.student.fullName,
        r.course.title.en,
        r.session.code,
        r.method,
        r.amount / 100,
        r.refundedAmount / 100,
        r.status,
        r.bookingStatus,
        r.providerTransactionId ?? "",
      ]),
    );
  }),

  http.get(`${MOCK_API}/payments/:id`, async ({ params }) => {
    await latency();
    const payment = db.payments.find((p) => p.id === params.id);
    if (!payment) return apiError(404, "NOT_FOUND", "Payment not found.");
    return itemResponse(paymentDetail(payment));
  }),

  http.post(`${MOCK_API}/payments/:id/refund`, async ({ params, request }) =>
    idempotent(request, `refund:${String(params.id)}`, async () => {
      await latency();
      const payment = db.payments.find((p) => p.id === params.id);
      if (!payment) return apiError(404, "NOT_FOUND", "Payment not found.");
      const booking = db.bookings.find((b) => b.id === payment.bookingId)!;
      const body = (await request.json()) as {
        amount?: number;
        refundTransactionId?: string;
        note?: string;
      };

      if (!canRecordRefund(payment.status, booking.status)) {
        return apiError(409, "CONFLICT", "This payment can't be refunded any more.", {
          payment: "INVALID_STATE",
        });
      }
      const remaining = payment.amount - payment.refundedAmount;
      const fields: Record<string, string> = {};
      if (!Number.isInteger(body.amount) || body.amount! < 100 || body.amount! > remaining)
        fields.amount = "OUT_OF_RANGE";
      if (!body.refundTransactionId?.trim()) fields.refundTransactionId = "REQUIRED";
      if (Object.keys(fields).length)
        return apiError(422, "VALIDATION_FAILED", "Check the refund details.", fields);

      // DBR-11: also for partial refunds — payment and booking Refunded, ticket Cancelled.
      const at = mockNow().toISOString();
      payment.status = "REFUNDED";
      payment.refundedAmount += body.amount!;
      payment.refundTransactionId = body.refundTransactionId!.trim();
      payment.refundNote = body.note?.trim() || null;
      payment.timeline.push({
        type: "REFUNDED",
        at,
        by: by(),
        note: payment.refundNote ?? undefined,
      });
      booking.status = "REFUNDED";
      return itemResponse(paymentDetail(payment));
    }),
  ),

  http.post(`${MOCK_API}/bookings/:id/move`, async ({ params, request }) =>
    idempotent(request, `move:${String(params.id)}`, async () => {
      await latency();
      const booking = db.bookings.find((b) => b.id === params.id);
      if (!booking) return apiError(404, "NOT_FOUND", "Booking not found.");
      const { targetSessionId } = (await request.json()) as { targetSessionId?: string };
      const from = findSession(booking.sessionId)!;
      const target = targetSessionId ? findSession(targetSessionId) : undefined;
      if (!canMoveBooking(booking.status))
        return apiError(409, "CONFLICT", "Only refund-required bookings can be moved.", {
          booking: "INVALID_STATE",
        });
      if (!target)
        return apiError(422, "VALIDATION_FAILED", "Choose a session of the same course.", {
          targetSessionId: "INVALID",
        });
      const now = mockNow();
      const course = findCourse(target.courseId);
      const problem = course?.archivedAt
        ? "NOT_OPEN"
        : moveTargetProblem(
            {
              courseId: target.courseId,
              isPublished: target.isPublished,
              isClosedManually: target.isClosedManually,
              firstStartsAt: target.meetings[0]!.startsAt,
              remainingSeats: getSessionAvailability(asDomainSession(target), now).remainingSeats,
            },
            from.courseId,
            now,
          );
      if (problem === "NO_SEATS")
        return apiError(409, "CONFLICT", "That session has no free seats.", {
          targetSessionId: "NO_SEATS",
        });
      if (problem)
        return apiError(422, "VALIDATION_FAILED", "Choose an open session of the same course.", {
          targetSessionId: problem,
        });

      // Seat check and status change together, with nothing in between (DBR-12).
      if (target.id !== from.id) booking.movedFromSessionId = from.id;
      booking.sessionId = target.id;
      booking.status = "PAID";
      const payment = db.payments.find(
        (p) => p.bookingId === booking.id && p.status === "SUCCEEDED",
      );
      payment?.timeline.push({
        type: "MOVED",
        at: now.toISOString(),
        by: by(),
        note: target.id === from.id ? `${from.code} (accepted)` : `${from.code} → ${target.code}`,
      });
      return itemResponse({ bookingId: booking.id, sessionId: target.id });
    }),
  ),

  http.post(`${MOCK_API}/bookings/:id/cancel`, async ({ params, request }) =>
    idempotent(request, `cancel:${String(params.id)}`, async () => {
      await latency();
      const booking = db.bookings.find((b) => b.id === params.id);
      if (!booking) return apiError(404, "NOT_FOUND", "Booking not found.");
      const { reason } = (await request.json()) as { reason?: string };
      const payment = db.payments.find(
        (p) => p.bookingId === booking.id && p.status === "SUCCEEDED",
      );
      if (!canCancelBooking(payment?.status ?? "FAILED", booking.status))
        return apiError(409, "CONFLICT", "Only paid bookings can be cancelled.", {
          booking: "INVALID_STATE",
        });
      if (!reason?.trim())
        return apiError(422, "VALIDATION_FAILED", "Give a reason.", { reason: "REQUIRED" });
      booking.status = "CANCELLED";
      booking.cancelledAt = mockNow().toISOString();
      booking.cancelReason = reason.trim();
      payment?.timeline.push({
        type: "CANCELLED",
        at: booking.cancelledAt,
        by: by(),
        note: booking.cancelReason,
      });
      return itemResponse({ bookingId: booking.id });
    }),
  ),
];

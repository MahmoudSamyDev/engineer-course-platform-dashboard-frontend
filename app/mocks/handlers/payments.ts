import { http } from "msw";
import type { PaymentMethod, PaymentRow, PaymentStatus, PaymentSummary } from "~/domain/api";
import { MOCK_API } from "../config";
import { db, mockNow } from "../db";
import { apiError, currentAdmin, latency } from "../http";
import { asDomainSession, findSession, paymentDetail, paymentRow } from "../views";
import { getSessionAvailability } from "~/domain/availability";
import { csvResponse, inRange, itemResponse, listResponse, matchesQuery, sortBy } from "./helpers";

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
      return matchesQuery(p.get("q"), r.reference, r.providerTransactionId, student.phoneE164, student.email, student.fullName);
    });
  return sortBy(rows, p.get("sort"), { createdAt: (r) => r.createdAt, amount: (r) => r.amount }, "-createdAt");
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
      ["created_at_utc", "reference", "student", "course", "session", "method", "amount_egp", "refunded_egp", "status", "booking_status", "transaction_id"],
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

  http.post(`${MOCK_API}/payments/:id/refund`, async ({ params, request }) => {
    await latency();
    const payment = db.payments.find((p) => p.id === params.id);
    if (!payment) return apiError(404, "NOT_FOUND", "Payment not found.");
    const booking = db.bookings.find((b) => b.id === payment.bookingId)!;
    const body = (await request.json()) as { amount?: number; refundTransactionId?: string; note?: string };

    if (payment.status !== "SUCCEEDED" || !["PAID", "REFUND_REQUIRED"].includes(booking.status)) {
      return apiError(409, "CONFLICT", "Only a paid payment can be refunded.");
    }
    const remaining = payment.amount - payment.refundedAmount;
    const fields: Record<string, string> = {};
    if (!Number.isInteger(body.amount) || body.amount! < 100 || body.amount! > remaining) fields.amount = "OUT_OF_RANGE";
    if (!body.refundTransactionId?.trim()) fields.refundTransactionId = "REQUIRED";
    if (Object.keys(fields).length) return apiError(422, "VALIDATION_FAILED", "Check the refund details.", fields);

    const at = mockNow().toISOString();
    payment.status = "REFUNDED";
    payment.refundedAmount += body.amount!;
    payment.refundTransactionId = body.refundTransactionId!.trim();
    payment.refundNote = body.note?.trim() || null;
    payment.timeline.push({ type: "REFUNDED", at, by: by(), note: payment.refundNote ?? undefined });
    booking.status = "REFUNDED";
    return itemResponse(paymentDetail(payment));
  }),

  http.post(`${MOCK_API}/bookings/:id/move`, async ({ params, request }) => {
    await latency();
    const booking = db.bookings.find((b) => b.id === params.id);
    if (!booking) return apiError(404, "NOT_FOUND", "Booking not found.");
    const { targetSessionId } = (await request.json()) as { targetSessionId?: string };
    const from = findSession(booking.sessionId)!;
    const target = targetSessionId ? findSession(targetSessionId) : undefined;
    if (booking.status !== "REFUND_REQUIRED") return apiError(409, "CONFLICT", "Only refund-required bookings can be moved.");
    if (!target || target.courseId !== from.courseId || target.id === from.id) {
      return apiError(422, "VALIDATION_FAILED", "Choose another session of the same course.", { targetSessionId: "INVALID" });
    }
    if (getSessionAvailability(asDomainSession(target), mockNow()).remainingSeats < 1) {
      return apiError(409, "CONFLICT", "That session has no free seats.", { targetSessionId: "NO_SEATS" });
    }
    booking.movedFromSessionId = from.id;
    booking.sessionId = target.id;
    booking.status = "PAID";
    const payment = db.payments.find((p) => p.bookingId === booking.id && p.status === "SUCCEEDED");
    payment?.timeline.push({ type: "MOVED", at: mockNow().toISOString(), by: by(), note: `${from.code} → ${target.code}` });
    return itemResponse({ bookingId: booking.id, sessionId: target.id });
  }),

  http.post(`${MOCK_API}/bookings/:id/cancel`, async ({ params, request }) => {
    await latency();
    const booking = db.bookings.find((b) => b.id === params.id);
    if (!booking) return apiError(404, "NOT_FOUND", "Booking not found.");
    const { reason } = (await request.json()) as { reason?: string };
    if (booking.status !== "PAID") return apiError(409, "CONFLICT", "Only paid bookings can be cancelled.");
    if (!reason?.trim()) return apiError(422, "VALIDATION_FAILED", "Give a reason.", { reason: "REQUIRED" });
    booking.status = "CANCELLED";
    booking.cancelledAt = mockNow().toISOString();
    booking.cancelReason = reason.trim();
    const payment = db.payments.find((p) => p.bookingId === booking.id && p.status === "SUCCEEDED");
    payment?.timeline.push({ type: "CANCELLED", at: booking.cancelledAt, by: by(), note: booking.cancelReason });
    return itemResponse({ bookingId: booking.id });
  }),
];

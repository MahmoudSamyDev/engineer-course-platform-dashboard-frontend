import type { ItemResponse, ListResponse } from "~/domain/admin";
import type {
  Page,
  PaymentDetail,
  PaymentFilters,
  PaymentRow,
  PaymentSummary,
  RecordRefundInput,
} from "~/domain/api";
import { api, toQueryString } from "~/store/api";

/** Everything a money or seat change can affect (DBR-11/12). */
const AFFECTED_BY_BOOKING_CHANGE = [
  "Payment",
  "Registration",
  "Student",
  "Overview",
  "Counts",
  "Session",
  "Course",
] as const;

/** SRS §7.2 — payments, refunds, move, cancel (DSH-PAY). */
/**
 * Refresh after success — and after a 409 too: the booking changed elsewhere (another admin,
 * a gateway callback), so the sheet must stop offering an action the API refuses.
 */
const refreshAfter = (_result: unknown, error: { status?: unknown } | undefined) =>
  !error || error.status === 409 ? [...AFFECTED_BY_BOOKING_CHANGE] : [];

export const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPayments: build.query<Page<PaymentRow> & { summary: PaymentSummary }, PaymentFilters>({
      query: (filters) => `/payments${toQueryString(filters)}`,
      transformResponse: (r: ListResponse<PaymentRow> & { meta: { summary: PaymentSummary } }) => ({
        items: r.data,
        ...r.meta,
      }),
      providesTags: [{ type: "Payment", id: "LIST" }],
    }),
    getPayment: build.query<PaymentDetail, string>({
      query: (id) => `/payments/${encodeURIComponent(id)}`,
      transformResponse: (r: ItemResponse<PaymentDetail>) => r.data,
      providesTags: (_r, _e, id) => [{ type: "Payment", id }],
    }),
    recordRefund: build.mutation<PaymentDetail, RecordRefundInput & { idempotencyKey: string }>({
      query: ({ paymentId, idempotencyKey, ...body }) => ({
        url: `/payments/${encodeURIComponent(paymentId)}/refund`,
        method: "POST",
        body,
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      transformResponse: (r: ItemResponse<PaymentDetail>) => r.data,
      invalidatesTags: refreshAfter,
    }),
    moveBooking: build.mutation<
      { bookingId: string; sessionId: string },
      { bookingId: string; targetSessionId: string; idempotencyKey: string }
    >({
      query: ({ bookingId, targetSessionId, idempotencyKey }) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/move`,
        method: "POST",
        body: { targetSessionId },
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      transformResponse: (r: ItemResponse<{ bookingId: string; sessionId: string }>) => r.data,
      invalidatesTags: refreshAfter,
    }),
    cancelBooking: build.mutation<
      { bookingId: string },
      { bookingId: string; reason: string; idempotencyKey: string }
    >({
      query: ({ bookingId, reason, idempotencyKey }) => ({
        url: `/bookings/${encodeURIComponent(bookingId)}/cancel`,
        method: "POST",
        body: { reason },
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      transformResponse: (r: ItemResponse<{ bookingId: string }>) => r.data,
      invalidatesTags: refreshAfter,
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useRecordRefundMutation,
  useMoveBookingMutation,
  useCancelBookingMutation,
} = paymentsApi;

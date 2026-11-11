import { useMemo, useState } from "react";
import type { AttendanceStatus, RegistrationFilters } from "~/domain/api";
import type { BookingStatus } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { isDateRange, rangeDates } from "~/lib/date-ranges";
import { useUrlParams } from "~/lib/use-url-params";

export const BOOKING_FILTERS = ["PAID", "REFUND_REQUIRED", "CANCELLED", "REFUNDED", "ALL"] as const;
export const ATTENDANCE_FILTERS: Array<Exclude<AttendanceStatus, "NONE">> = [
  "UPCOMING",
  "ATTENDED",
  "ABSENT",
  "COMPLETED",
];

/**
 * Structured filters from the URL (pure, shared by the hook and the route's `clientLoader`).
 * Booking status defaults to Paid (DSH-STU-03). The search term never comes from the URL.
 */
export function registrationFiltersFromUrl(
  params: URLSearchParams,
  q?: string,
): RegistrationFilters {
  const get = (key: string) => params.get(key) ?? undefined;
  const range = get("range");
  return {
    q: q || undefined,
    courseId: get("course"),
    sessionId: get("session"),
    bookingStatus: (get("status") as BookingStatus | "ALL" | undefined) ?? "PAID",
    attendance: get("attendance") as Exclude<AttendanceStatus, "NONE"> | undefined,
    ...rangeDates(isDateRange(range) ? range : undefined, appNow()),
    sort: (get("sort") as RegistrationFilters["sort"]) ?? "-registeredAt",
    page: Number(get("page")) || 1,
    pageSize: Number(get("size")) || 25,
  };
}

/** Students list state: structured filters in the URL, the search term in memory only (DSH-GEN-04). */
export function useRegistrationFilters() {
  const url = useUrlParams();
  const [q, setQ] = useState("");
  const status = (url.get("status") as BookingStatus | "ALL" | undefined) ?? "PAID";
  const range = url.get("range");
  const filters = useMemo(() => registrationFiltersFromUrl(url.params, q), [url.params, q]);

  return { filters, q, setQ, url, status, range: isDateRange(range) ? range : undefined };
}

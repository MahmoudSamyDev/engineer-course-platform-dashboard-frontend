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
 * Students list state: structured filters in the URL, the search term in memory only
 * (DSH-GEN-04). Booking status defaults to Paid (DSH-STU-03).
 */
export function useRegistrationFilters() {
  const url = useUrlParams();
  const [q, setQ] = useState("");
  const status = (url.get("status") as BookingStatus | "ALL" | undefined) ?? "PAID";
  const range = url.get("range");

  const filters: RegistrationFilters = useMemo(
    () => ({
      q: q || undefined,
      courseId: url.get("course"),
      sessionId: url.get("session"),
      bookingStatus: status,
      attendance: url.get("attendance") as Exclude<AttendanceStatus, "NONE"> | undefined,
      ...rangeDates(isDateRange(range) ? range : undefined, appNow()),
      sort: (url.get("sort") as RegistrationFilters["sort"]) ?? "-registeredAt",
      page: Number(url.get("page")) || 1,
      pageSize: Number(url.get("size")) || 25,
    }),
    [q, url, status, range],
  );

  return { filters, q, setQ, url, status, range: isDateRange(range) ? range : undefined };
}

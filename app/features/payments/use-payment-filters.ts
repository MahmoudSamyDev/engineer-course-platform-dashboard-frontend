import { useMemo, useState } from "react";
import type { PaymentFilters, PaymentMethod, PaymentStatus } from "~/domain/api";
import { appNow } from "~/lib/clock";
import { isDateRange, rangeDates } from "~/lib/date-ranges";
import { useUrlParams } from "~/lib/use-url-params";

export const PAYMENT_STATUSES: PaymentStatus[] = ["SUCCEEDED", "INITIATED", "FAILED", "REFUNDED"];
export const PAYMENT_METHODS: PaymentMethod[] = ["CARD", "WALLET"];

/** Payments list state (DSH-PAY-03): filters in the URL, search term in memory. */
export function usePaymentFilters() {
  const url = useUrlParams();
  const [q, setQ] = useState("");
  const range = url.get("range");
  const filters: PaymentFilters = useMemo(
    () => ({
      q: q || undefined,
      status: url.get("status") as PaymentStatus | undefined,
      method: url.get("method") as PaymentMethod | undefined,
      courseId: url.get("course"),
      needsAction: url.get("needsAction") === "true" || undefined,
      ...rangeDates(isDateRange(range) ? range : undefined, appNow()),
      sort: (url.get("sort") as PaymentFilters["sort"]) ?? "-createdAt",
      page: Number(url.get("page")) || 1,
      pageSize: Number(url.get("size")) || 25,
    }),
    [q, url, range],
  );
  const clear = () => {
    setQ("");
    url.set({
      status: undefined,
      method: undefined,
      course: undefined,
      needsAction: undefined,
      range: undefined,
    });
  };
  return { filters, q, setQ, url, range: isDateRange(range) ? range : undefined, clear };
}

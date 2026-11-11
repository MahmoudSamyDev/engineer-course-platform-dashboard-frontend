import { useMemo, useState } from "react";
import type { PaymentFilters, PaymentMethod, PaymentStatus } from "~/domain/api";
import { appNow } from "~/lib/clock";
import { isDateRange, rangeDates } from "~/lib/date-ranges";
import { useUrlParams } from "~/lib/use-url-params";

export const PAYMENT_STATUSES: PaymentStatus[] = ["SUCCEEDED", "INITIATED", "FAILED", "REFUNDED"];
export const PAYMENT_METHODS: PaymentMethod[] = ["CARD", "WALLET"];

/** Filters from the URL (pure: shared by the hook and the route's `clientLoader`). */
export function paymentFiltersFromUrl(params: URLSearchParams, q?: string): PaymentFilters {
  const get = (key: string) => params.get(key) ?? undefined;
  const range = get("range");
  return {
    q: q || undefined,
    status: get("status") as PaymentStatus | undefined,
    method: get("method") as PaymentMethod | undefined,
    courseId: get("course"),
    needsAction: get("needsAction") === "true" || undefined,
    ...rangeDates(isDateRange(range) ? range : undefined, appNow()),
    sort: (get("sort") as PaymentFilters["sort"]) ?? "-createdAt",
    page: Number(get("page")) || 1,
    pageSize: Number(get("size")) || 25,
  };
}

/** Payments list state (DSH-PAY-03): filters in the URL, search term in memory. */
export function usePaymentFilters() {
  const url = useUrlParams();
  const [q, setQ] = useState("");
  const range = url.get("range");
  const filters = useMemo(() => paymentFiltersFromUrl(url.params, q), [url.params, q]);
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

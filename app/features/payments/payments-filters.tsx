import { TriangleAlert } from "lucide-react";
import { useTranslations } from "use-intl";
import { ExportButton } from "~/components/export-button";
import { Button } from "~/components/ui/button";
import { FilterBar, FilterChips, SearchInput } from "~/components/ui/filter-bar";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/cn";
import { DATE_RANGES } from "~/lib/date-ranges";
import { toQueryString } from "~/store/api";
import { useCourseOptions } from "../courses/options";
import { PAYMENT_METHODS, PAYMENT_STATUSES, type usePaymentFilters } from "./use-payment-filters";

/** Search + status/method/course/date filters + the Needs action quick filter (DSH-PAY-03). */
export function PaymentsFilters({
  state,
  needsActionCount,
}: {
  state: ReturnType<typeof usePaymentFilters>;
  needsActionCount: number;
}) {
  const t = useTranslations("payments.filters");
  const ts = useTranslations("status");
  const tr = useTranslations("ranges");
  const { filters, q, setQ, url, range, clear } = state;
  const courses = useCourseOptions();

  const chips = [
    filters.needsAction && {
      key: "needs",
      label: t("needsAction"),
      onRemove: () => url.set({ needsAction: undefined }),
    },
    filters.status && {
      key: "status",
      label: ts(`payment.${filters.status}`),
      onRemove: () => url.set({ status: undefined }),
    },
    filters.method && {
      key: "method",
      label: ts(`method.${filters.method}`),
      onRemove: () => url.set({ method: undefined }),
    },
    filters.courseId && {
      key: "course",
      label: courses.find((c) => c.value === filters.courseId)?.label ?? filters.courseId,
      onRemove: () => url.set({ course: undefined }),
    },
    range && { key: "range", label: tr(range), onRemove: () => url.set({ range: undefined }) },
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  const { page: _p, pageSize: _s, sort: _o, ...exportFilters } = filters;

  return (
    <>
      <FilterBar
        search={
          <SearchInput
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            value={q}
            onSearch={setQ}
          />
        }
        activeCount={chips.length}
        actions={
          <ExportButton
            path="/payments/export.csv"
            query={toQueryString(exportFilters)}
            filename="payments.csv"
          />
        }
      >
        <Button
          variant="secondary"
          aria-pressed={Boolean(filters.needsAction)}
          onClick={() => url.set({ needsAction: filters.needsAction ? undefined : true })}
          className={cn(
            filters.needsAction &&
              "border-warning bg-warning-wash text-warning hover:bg-warning-wash",
          )}
        >
          <TriangleAlert aria-hidden="true" />
          {t("needsActionCount", { count: needsActionCount })}
        </Button>
        <Select
          aria-label={t("status")}
          value={filters.status}
          onValueChange={(value) => url.set({ status: value })}
          options={PAYMENT_STATUSES.map((s) => ({ value: s, label: ts(`payment.${s}`) }))}
          allLabel={t("allStatuses")}
        />
        <Select
          aria-label={t("method")}
          value={filters.method}
          onValueChange={(value) => url.set({ method: value })}
          options={PAYMENT_METHODS.map((m) => ({ value: m, label: ts(`method.${m}`) }))}
          allLabel={t("allMethods")}
        />
        <Select
          aria-label={t("course")}
          value={filters.courseId}
          onValueChange={(value) => url.set({ course: value })}
          options={courses}
          allLabel={t("allCourses")}
        />
        <Select
          aria-label={t("date")}
          value={range}
          onValueChange={(value) => url.set({ range: value })}
          options={DATE_RANGES.map((r) => ({ value: r, label: tr(r) }))}
          allLabel={tr("all")}
        />
      </FilterBar>
      <FilterChips chips={chips} onClearAll={clear} />
    </>
  );
}

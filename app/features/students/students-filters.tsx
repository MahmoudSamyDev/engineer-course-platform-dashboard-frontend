import { useTranslations } from "use-intl";
import { ExportButton } from "~/components/export-button";
import { FilterBar, FilterChips, SearchInput } from "~/components/ui/filter-bar";
import { Select } from "~/components/ui/select";
import { DATE_RANGES } from "~/lib/date-ranges";
import { toQueryString } from "~/store/api";
import { useCourseOptions, useSessionOptions } from "../courses/options";
import { ATTENDANCE_FILTERS, BOOKING_FILTERS, type useRegistrationFilters } from "./use-registration-filters";

type State = ReturnType<typeof useRegistrationFilters>;

/** Search + course/session/status/attendance/date filters with removable chips (DSH-STU-02/03). */
export function StudentsFilters({ state }: { state: State }) {
  const t = useTranslations("students.filters");
  const ts = useTranslations("status");
  const tr = useTranslations("ranges");
  const { filters, q, setQ, url, status, range } = state;
  const courses = useCourseOptions();
  const sessions = useSessionOptions(filters.courseId);

  const chips = [
    filters.courseId && {
      key: "course",
      label: courses.find((c) => c.value === filters.courseId)?.label ?? filters.courseId,
      onRemove: () => url.set({ course: undefined, session: undefined }),
    },
    filters.sessionId && { key: "session", label: filters.sessionId, onRemove: () => url.set({ session: undefined }) },
    status !== "PAID" && {
      key: "status",
      label: status === "ALL" ? t("allStatuses") : ts(`booking.${status}`),
      onRemove: () => url.set({ status: undefined }),
    },
    filters.attendance && {
      key: "attendance",
      label: ts(`attendanceFilter.${filters.attendance}`),
      onRemove: () => url.set({ attendance: undefined }),
    },
    range && { key: "range", label: tr(range), onRemove: () => url.set({ range: undefined }) },
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  const { page: _page, pageSize: _size, sort: _sort, ...exportFilters } = filters;

  return (
    <>
      <FilterBar
        search={<SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} value={q} onSearch={setQ} />}
        activeCount={chips.length}
        actions={<ExportButton path="/registrations/export.csv" query={toQueryString(exportFilters)} filename="registrations.csv" />}
      >
        <Select
          aria-label={t("course")}
          value={filters.courseId}
          onValueChange={(value) => url.set({ course: value, session: undefined })}
          options={courses}
          allLabel={t("allCourses")}
        />
        {filters.courseId ? (
          <Select
            aria-label={t("session")}
            value={filters.sessionId}
            onValueChange={(value) => url.set({ session: value })}
            options={sessions}
            allLabel={t("allSessions")}
          />
        ) : null}
        <Select
          aria-label={t("status")}
          value={status}
          onValueChange={(value) => url.set({ status: value === "PAID" ? undefined : value })}
          options={BOOKING_FILTERS.map((s) => ({ value: s, label: s === "ALL" ? t("allStatuses") : ts(`booking.${s}`) }))}
        />
        <Select
          aria-label={t("attendance")}
          value={filters.attendance}
          onValueChange={(value) => url.set({ attendance: value })}
          options={ATTENDANCE_FILTERS.map((a) => ({
            value: a,
            label: ts(`attendanceFilter.${a}`),
          }))}
          allLabel={t("anyAttendance")}
        />
        <Select
          aria-label={t("date")}
          value={range}
          onValueChange={(value) => url.set({ range: value })}
          options={DATE_RANGES.map((r) => ({ value: r, label: tr(r) }))}
          allLabel={tr("all")}
        />
      </FilterBar>
      <FilterChips chips={chips} onClearAll={() => {
        setQ("");
        url.set({ course: undefined, session: undefined, status: undefined, attendance: undefined, range: undefined });
      }} />
    </>
  );
}

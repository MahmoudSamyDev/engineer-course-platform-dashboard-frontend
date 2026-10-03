import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { Pagination } from "~/components/ui/pagination";
import { StudentsFilters } from "~/features/students/students-filters";
import { StudentsTable } from "~/features/students/students-table";
import { useGetRegistrationsQuery } from "~/features/students/api";
import { useRegistrationFilters } from "~/features/students/use-registration-filters";

/** Students — "Who is registered?" (SRS §4.4, DUS-06…08, DAC-05). */
export default function Students() {
  const t = useTranslations("pages.students");
  const state = useRegistrationFilters();
  const { filters, url, setQ } = state;
  const { data, error, isLoading, isFetching, refetch } = useGetRegistrationsQuery(filters);
  const filtered = Boolean(filters.q || filters.courseId || filters.attendance || state.range || state.status !== "PAID");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <StudentsFilters state={state} />
      <div aria-busy={isFetching} className={isFetching && !isLoading ? "opacity-70 transition-opacity" : undefined}>
        <StudentsTable
          rows={data?.items}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          sort={filters.sort ?? "-registeredAt"}
          onSortChange={(sort) => url.set({ sort: sort === "-registeredAt" ? undefined : sort })}
          filtered={filtered}
          onClearFilters={() => {
            setQ("");
            url.set({ course: undefined, session: undefined, status: undefined, attendance: undefined, range: undefined });
          }}
        />
        {data ? (
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={(page) => url.set({ page: page === 1 ? undefined : page })}
            onPageSizeChange={(size) => url.set({ size: size === 25 ? undefined : size })}
          />
        ) : null}
      </div>
    </>
  );
}

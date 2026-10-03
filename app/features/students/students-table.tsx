import { MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { DateTime, Ltr, Phone, whatsappUrl } from "~/components/format";
import { AttendanceLabel, BookingBadge } from "~/components/status";
import { DataTable, type Column } from "~/components/ui/data-table";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";
import type { RegistrationRow } from "~/domain/api";
import type { Locale } from "~/domain/types";

/** Registrations table (DSH-STU-01/04/07/08). */
export function StudentsTable({
  rows,
  loading,
  error,
  onRetry,
  sort,
  onSortChange,
  filtered,
  onClearFilters,
}: {
  rows: RegistrationRow[] | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  sort: string;
  onSortChange: (sort: string) => void;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const t = useTranslations("students");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const location = useLocation();
  const from = { from: `${location.pathname}${location.search}` };

  const columns: Column<RegistrationRow>[] = [
    {
      key: "student",
      header: t("columns.student"),
      sortKey: "name",
      cell: (r) => (
        <div className="min-w-44">
          <Link to={`/students/${r.student.id}`} state={from} className="font-medium text-ink hover:text-cyan hover:underline">
            {r.student.fullName}
          </Link>
          <div className="flex items-center gap-1 text-caption text-graphite">
            <Phone e164={r.student.phoneE164} />
            <a
              href={whatsappUrl(r.student.phoneE164)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tc("whatsapp")}: ${r.student.fullName}`}
              className="-my-1 inline-flex size-7 items-center justify-center rounded-sm hover:bg-cyan-wash hover:text-success"
            >
              <MessageCircle aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: t("columns.course"),
      sortKey: "course",
      cell: (r) => (
        <div className="max-w-56">
          <div className="truncate">{r.course.title[locale]}</div>
          <div className="text-caption text-graphite">
            <Ltr>{r.session.code}</Ltr>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("columns.department"),
      className: "hidden 2xl:table-cell",
      cell: (r) => <span className="text-caption text-graphite">{r.student.department[locale]}</span>,
    },
    { key: "registered", header: t("columns.registered"), sortKey: "registeredAt", cell: (r) => <DateTime iso={r.registeredAt} short /> },
    { key: "status", header: t("columns.status"), cell: (r) => <BookingBadge status={r.status} /> },
    { key: "attendance", header: t("columns.attendance"), cell: (r) => <AttendanceLabel attendance={r.attendance} /> },
    {
      key: "reference",
      header: t("columns.reference"),
      className: "hidden 2xl:table-cell",
      cell: (r) => (
        <Ltr className="tabular text-caption text-graphite">{r.reference}</Ltr>
      ),
    },
  ];

  return (
    <DataTable
      caption={t("caption")}
      columns={columns}
      rows={rows}
      getRowId={(r) => r.bookingId}
      rowHref={(r) => `/students/${r.student.id}`}
      rowState={from}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sort={sort}
      onSortChange={onSortChange}
      mobileRow={(r) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium text-ink">{r.student.fullName}</span>
            <BookingBadge status={r.status} />
          </div>
          <span className="truncate text-caption text-graphite">
            {r.course.title[locale]} · <Ltr>{r.session.code}</Ltr>
          </span>
          <span className="flex items-center justify-between gap-3 text-caption text-graphite">
            <DateTime iso={r.registeredAt} short />
            <AttendanceLabel attendance={r.attendance} />
          </span>
        </div>
      )}
      empty={
        filtered ? (
          <EmptyState
            title={t("noResults")}
            description={t("noResultsHint")}
            action={<Button variant="secondary" onClick={onClearFilters}>{tc("clearAll")}</Button>}
          />
        ) : (
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        )
      }
    />
  );
}

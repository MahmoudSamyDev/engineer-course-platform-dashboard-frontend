import { useLocale, useTranslations } from "use-intl";
import { DateTime, Ltr, Money } from "~/components/format";
import { BookingBadge, PaymentBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { DataTable, type Column } from "~/components/ui/data-table";
import { EmptyState } from "~/components/ui/empty-state";
import type { PaymentRow } from "~/domain/api";
import type { Locale } from "~/domain/types";

const NEEDS_ATTENTION = new Set(["REFUND_REQUIRED", "CANCELLED"]);

/** Payments table (DSH-PAY-01). Selecting a row opens the details sheet. */
export function PaymentsTable({
  rows,
  loading,
  error,
  onRetry,
  sort,
  onSortChange,
  onOpen,
  filtered,
  onClearFilters,
}: {
  rows: PaymentRow[] | undefined;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onOpen: (id: string) => void;
  filtered: boolean;
  onClearFilters: () => void;
}) {
  const t = useTranslations("payments");
  const tc = useTranslations("common");
  const ts = useTranslations("status");
  const locale = useLocale() as Locale;

  const statusCell = (p: PaymentRow) => (
    <div className="flex flex-wrap gap-1">
      <PaymentBadge status={p.status} />
      {NEEDS_ATTENTION.has(p.bookingStatus) ? <BookingBadge status={p.bookingStatus} /> : null}
    </div>
  );

  const columns: Column<PaymentRow>[] = [
    {
      key: "date",
      header: t("columns.date"),
      sortKey: "createdAt",
      cell: (p) => <DateTime iso={p.createdAt} short />,
    },
    {
      key: "student",
      header: t("columns.student"),
      cell: (p) => (
        <div className="min-w-40">
          <button
            type="button"
            onClick={() => onOpen(p.id)}
            className="text-start font-medium text-ink hover:text-cyan hover:underline"
          >
            {p.student.fullName}
          </button>
          <div className="text-caption text-graphite">
            <Ltr className="tabular">{p.reference}</Ltr>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: t("columns.course"),
      cell: (p) => (
        <div className="max-w-56">
          <div className="truncate">{p.course.title[locale]}</div>
          <div className="text-caption text-graphite">
            <Ltr>{p.session.code}</Ltr>
          </div>
        </div>
      ),
    },
    { key: "method", header: t("columns.method"), cell: (p) => ts(`method.${p.method}`) },
    {
      key: "amount",
      header: t("columns.amount"),
      sortKey: "amount",
      align: "end",
      cell: (p) => (
        <div>
          <div className="font-semibold">
            <Money amount={p.amount} />
          </div>
          {p.refundedAmount > 0 ? (
            <div className="text-caption text-graphite">
              {t("refundedAmount")} <Money amount={p.refundedAmount} />
            </div>
          ) : null}
        </div>
      ),
    },
    { key: "status", header: t("columns.status"), cell: statusCell },
  ];

  return (
    <DataTable
      caption={t("caption")}
      columns={columns}
      rows={rows}
      getRowId={(p) => p.id}
      onRowClick={(p) => onOpen(p.id)}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sort={sort}
      onSortChange={onSortChange}
      mobileRow={(p) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium text-ink">{p.student.fullName}</span>
            <span className="font-semibold">
              <Money amount={p.amount} />
            </span>
          </div>
          <span className="truncate text-caption text-graphite">
            <Ltr>{p.reference}</Ltr> · <Ltr>{p.course.code}</Ltr> · {ts(`method.${p.method}`)}
          </span>
          <span className="flex items-center justify-between gap-3 text-caption text-graphite">
            <DateTime iso={p.createdAt} short />
            {statusCell(p)}
          </span>
        </div>
      )}
      empty={
        filtered ? (
          <EmptyState
            title={t("noResults")}
            description={t("noResultsHint")}
            action={
              <Button variant="secondary" onClick={onClearFilters}>
                {tc("clearAll")}
              </Button>
            }
          />
        ) : (
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        )
      }
    />
  );
}

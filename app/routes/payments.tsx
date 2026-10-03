import { useTranslations } from "use-intl";
import { Money } from "~/components/format";
import { PageHeader } from "~/components/layout/page-header";
import { Pagination } from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { TitleBlock, TitleCell } from "~/components/ui/title-block";
import { useGetCountsQuery } from "~/features/overview/api";
import { useGetPaymentsQuery } from "~/features/payments/api";
import { PaymentSheet } from "~/features/payments/payment-sheet";
import { PaymentsFilters } from "~/features/payments/payments-filters";
import { PaymentsTable } from "~/features/payments/payments-table";
import { usePaymentFilters } from "~/features/payments/use-payment-filters";

/** Payments — "Do the numbers reconcile, and what needs action?" (SRS §4.5, DUS-09…11, DAC-04). */
export default function Payments() {
  const t = useTranslations("payments");
  const tp = useTranslations("pages.payments");
  const state = usePaymentFilters();
  const { filters, url } = state;
  const { data, error, isLoading, isFetching, refetch } = useGetPaymentsQuery(filters, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });
  const { data: counts } = useGetCountsQuery();
  const openId = url.get("payment");
  const filtered = Boolean(
    filters.q ||
    filters.status ||
    filters.method ||
    filters.courseId ||
    filters.needsAction ||
    state.range,
  );

  return (
    <>
      <PageHeader title={tp("title")} description={tp("description")} />
      <PaymentsFilters state={state} needsActionCount={counts?.refundRequired ?? 0} />

      <section aria-label={t("summary.label")} className="mb-4">
        {data ? (
          <TitleBlock>
            <TitleCell
              size="fact"
              label={t("summary.gross")}
              value={<Money amount={data.summary.gross} />}
            />
            <TitleCell
              size="fact"
              label={t("summary.refunded")}
              value={<Money amount={data.summary.refunded} />}
            />
            <TitleCell
              size="fact"
              label={t("summary.net")}
              value={<Money amount={data.summary.net} />}
            />
            <TitleCell
              size="fact"
              label={t("summary.count")}
              value={data.summary.count}
              note={filtered ? t("summary.filtered") : t("summary.all")}
            />
          </TitleBlock>
        ) : (
          <Skeleton className="h-[5.5rem] w-full" />
        )}
      </section>

      <div
        aria-busy={isFetching}
        className={isFetching && !isLoading ? "opacity-70 transition-opacity" : undefined}
      >
        <PaymentsTable
          rows={data?.items}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          sort={filters.sort ?? "-createdAt"}
          onSortChange={(sort) => url.set({ sort: sort === "-createdAt" ? undefined : sort })}
          onOpen={(id) =>
            url.set({ payment: id, page: filters.page === 1 ? undefined : filters.page })
          }
          filtered={filtered}
          onClearFilters={state.clear}
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
      <PaymentSheet
        id={openId}
        onClose={() =>
          url.set({ payment: undefined, page: filters.page === 1 ? undefined : filters.page })
        }
      />
    </>
  );
}

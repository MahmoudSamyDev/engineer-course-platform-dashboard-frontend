import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { ErrorState } from "~/components/ui/error-state";
import { overviewApi, useGetOverviewQuery } from "~/features/overview/api";
import { HomeSkeleton } from "~/features/overview/home-skeleton";
import { KpiStrip } from "~/features/overview/kpi-strip";
import { LatestPayments, LatestRegistrations, UpcomingSessions } from "~/features/overview/lists";
import { NeedsAction } from "~/features/overview/needs-action";
import { RevenueChart } from "~/features/overview/revenue-chart";
import { StartGuide } from "~/features/overview/start-guide";
import { store } from "~/store/store";

export async function clientLoader() {
  store.dispatch(overviewApi.endpoints.getOverview.initiate(undefined, { subscribe: false }));
  return null;
}

/** Home — "How is the business doing, and what needs me?" (SRS §4.3, DUS-03…05). */
export default function Home() {
  const t = useTranslations("pages.home");
  const { data, error, isLoading, refetch } = useGetOverviewQuery(undefined, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {isLoading ? (
        <HomeSkeleton />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data.hasCourses ? (
        <StartGuide />
      ) : (
        <div className="flex flex-col gap-6">
          <KpiStrip kpis={data.kpis} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <NeedsAction needs={data.needsAction} />
            <RevenueChart data={data.revenueByMonth} />
            <LatestPayments items={data.latestPayments} />
            <UpcomingSessions items={data.upcomingSessions} />
          </div>
          <LatestRegistrations items={data.latestRegistrations} />
        </div>
      )}
    </>
  );
}

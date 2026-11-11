import { ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr } from "~/components/format";
import { PageHeader } from "~/components/layout/page-header";
import { CourseStatusBadge, PublicationBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { Skeleton } from "~/components/ui/skeleton";
import { UrlTabs } from "~/components/ui/tabs";
import type { Locale } from "~/domain/types";
import { coursesApi, useGetCourseQuery } from "~/features/courses/api";
import { ContentTab } from "~/features/courses/tabs/content-tab";
import { CurriculumTab } from "~/features/courses/tabs/curriculum-tab";
import { FaqTab } from "~/features/courses/tabs/faq-tab";
import { OverviewTab } from "~/features/courses/tabs/overview-tab";
import { PublishingTab } from "~/features/courses/tabs/publishing-tab";
import { SessionsTab } from "~/features/courses/tabs/sessions-tab";
import { websiteCourseUrl } from "~/lib/website-url";
import { store } from "~/store/store";
import type { Route } from "./+types/course";

const TABS = ["overview", "content", "curriculum", "sessions", "faq", "publishing"] as const;
type Tab = (typeof TABS)[number];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  store.dispatch(coursesApi.endpoints.getCourse.initiate(params.courseId, { subscribe: false }));
  return null;
}

/** Course details with independently saved tabs (SRS §4.6, DUS-14/15). */
export default function Course() {
  const { courseId = "" } = useParams();
  const t = useTranslations("course");
  const tp = useTranslations("pages");
  const locale = useLocale() as Locale;
  const { data: course, error, isLoading, refetch } = useGetCourseQuery(courseId);
  const back = { to: "/courses", label: tp("courses.title") };

  if (isLoading) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-6">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (error && "status" in error && error.status === 404) {
    return (
      <>
        <PageHeader title={tp("course.title")} back={back} />
        <EmptyState
          title={t("notFound")}
          action={
            <Button asChild variant="secondary">
              <Link to="/courses">{tp("courses.title")}</Link>
            </Button>
          }
        />
      </>
    );
  }
  if (error || !course) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={course.title[locale] || course.title.en || course.title.ar}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Ltr className="tabular">{course.code}</Ltr>
            <PublicationBadge state={course.state} />
            {course.state !== "ARCHIVED" ? <CourseStatusBadge status={course.status} /> : null}
          </span>
        }
        back={back}
        actions={
          course.state === "PUBLISHED" ? (
            <Button asChild variant="secondary">
              <a href={websiteCourseUrl(course.slug, locale)} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" />
                {t("publishing.viewOnWebsite")}
              </a>
            </Button>
          ) : null
        }
      />

      <UrlTabs
        label={t("tabsLabel")}
        defaultTab={"overview" as Tab}
        tabs={TABS.map((tab) => ({
          value: tab,
          label: t(`publishing.tabs.${tab}`),
          marker:
            tab === "publishing" && course.readiness.length > 0 ? (
              <span className="tabular inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-warning-wash px-1.5 text-caption font-semibold text-warning">
                {course.readiness.length}
                <span className="sr-only"> {t("publishing.missingCount")}</span>
              </span>
            ) : undefined,
        }))}
      >
        {(tab) => {
          switch (tab) {
            case "content":
              return <ContentTab course={course} />;
            case "curriculum":
              return <CurriculumTab course={course} />;
            case "sessions":
              return <SessionsTab course={course} />;
            case "faq":
              return <FaqTab course={course} />;
            case "publishing":
              return <PublishingTab course={course} />;
            default:
              return <OverviewTab course={course} />;
          }
        }}
      </UrlTabs>
    </>
  );
}

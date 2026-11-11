import { Archive, ArchiveRestore, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr, Money } from "~/components/format";
import { CourseStatusBadge, PublicationBadge } from "~/components/status";
import { ActionMenu, ActionMenuItem, ActionMenuSeparator } from "~/components/ui/menu";
import type { CourseCard as CourseCardData } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { formatDate } from "~/lib/format";
import { CourseCover } from "./course-cover";
import { websiteCourseUrl } from "~/lib/website-url";

/** Course card (DSH-CRS-01, DESIGN_SYSTEM §7.4): sheet cover, badges, title, title-block facts. */
export function CourseCard({
  course,
  onArchive,
  onRestore,
  onDelete,
}: {
  course: CourseCardData;
  onArchive: (course: CourseCardData) => void;
  onRestore: (course: CourseCardData) => void;
  onDelete: (course: CourseCardData) => void;
}) {
  const t = useTranslations("courses.card");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const next = course.nextSession;
  const navigate = useNavigate();

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-line bg-sheet transition-colors duration-150 hover:border-line-strong">
      <Link to={`/courses/${course.id}`} tabIndex={-1} aria-hidden="true">
        <CourseCover
          code={course.code}
          discipline={course.coverDiscipline}
          sortOrder={course.sortOrder}
          locale={locale}
          className="border-b border-line"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <PublicationBadge state={course.state} />
            {course.state !== "ARCHIVED" ? <CourseStatusBadge status={course.status} /> : null}
          </div>
          <ActionMenu label={`${tc("moreActions")}: ${course.title[locale]}`}>
            <ActionMenuItem onSelect={() => navigate(`/courses/${course.id}`)}>
              <Pencil aria-hidden="true" />
              {t("edit")}
            </ActionMenuItem>
            {course.state === "PUBLISHED" ? (
              <ActionMenuItem
                onSelect={() =>
                  window.open(websiteCourseUrl(course.slug, locale), "_blank", "noopener")
                }
              >
                <ExternalLink aria-hidden="true" />
                {t("viewOnWebsite")}
              </ActionMenuItem>
            ) : null}
            <ActionMenuSeparator />
            {course.state === "ARCHIVED" ? (
              <ActionMenuItem onSelect={() => onRestore(course)}>
                <ArchiveRestore aria-hidden="true" />
                {t("restore")}
              </ActionMenuItem>
            ) : (
              <ActionMenuItem onSelect={() => onArchive(course)}>
                <Archive aria-hidden="true" />
                {t("archive")}
              </ActionMenuItem>
            )}
            {course.state === "DRAFT" && course.upcomingSessionsCount === 0 ? (
              <ActionMenuItem destructive onSelect={() => onDelete(course)}>
                <Trash2 aria-hidden="true" />
                {t("delete")}
              </ActionMenuItem>
            ) : null}
          </ActionMenu>
        </div>
        <h2 className="line-clamp-2 text-subheading font-semibold">
          <Link to={`/courses/${course.id}`} className="hover:text-cyan hover:underline">
            {course.title[locale] || course.title.en || course.title.ar}
          </Link>
        </h2>
        <p className="text-caption text-graphite">
          <Ltr>{course.code}</Ltr> · {t("upcomingCount", { count: course.upcomingSessionsCount })}
        </p>
      </div>
      <dl className="grid grid-cols-3 border-t border-line text-caption">
        <div className="flex min-w-0 flex-col gap-0.5 border-e border-line px-3 py-2.5">
          <dt className="text-graphite">{t("nextSession")}</dt>
          <dd className="truncate font-medium text-ink">
            {next ? formatDate(next.startsAt, locale) : "—"}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 border-e border-line px-3 py-2.5">
          <dt className="text-graphite">{t("seats")}</dt>
          <dd className="tabular truncate font-medium text-ink">
            {next ? tc("seatsOf", { sold: next.sold, capacity: next.capacity }) : "—"}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
          <dt className="text-graphite">{t("price")}</dt>
          <dd className="truncate font-medium text-ink">
            <Money amount={course.basePrice} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

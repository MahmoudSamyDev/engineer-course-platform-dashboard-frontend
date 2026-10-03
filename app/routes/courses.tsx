import { BookOpenText, Plus } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { SearchInput } from "~/components/ui/filter-bar";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/toast";
import type { CourseCard as CourseCardData } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { AddCourseDialog } from "~/features/courses/add-course-dialog";
import { coursesApi, useDeleteCourseMutation, useGetCoursesQuery, useSetCourseArchivedMutation } from "~/features/courses/api";
import { CourseCard } from "~/features/courses/course-card";
import { cn } from "~/lib/cn";
import { useUrlParams } from "~/lib/use-url-params";
import { getApiError } from "~/store/api";
import { store } from "~/store/store";

const STATES = ["all", "published", "draft", "archived"] as const;
type StateTab = (typeof STATES)[number];

export async function clientLoader() {
  store.dispatch(coursesApi.endpoints.getCourses.initiate({}, { subscribe: false }));
  return null;
}

/** Courses — "What am I offering, and is it bookable?" (SRS §4.6, DUS-12/13). */
export default function Courses() {
  const t = useTranslations("courses");
  const tp = useTranslations("pages.courses");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const url = useUrlParams();
  const [q, setQ] = useState("");
  const tab = (STATES as readonly string[]).includes(url.get("state") ?? "") ? (url.get("state") as StateTab) : "all";
  const { data, error, isLoading, refetch } = useGetCoursesQuery({ state: tab === "all" ? undefined : tab, q: q || undefined });
  const [archive, archiveState] = useSetCourseArchivedMutation();
  const [remove, removeState] = useDeleteCourseMutation();
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete"; course: CourseCardData } | null>(null);
  const adding = url.get("new") === "1";

  async function runConfirm() {
    if (!confirm) return;
    try {
      if (confirm.kind === "archive") {
        await archive({ id: confirm.course.id, archived: true }).unwrap();
        toast({ title: t("archived"), description: confirm.course.title[locale] });
      } else {
        await remove(confirm.course.id).unwrap();
        toast({ title: t("deleted"), description: confirm.course.title[locale] });
      }
      setConfirm(null);
    } catch (e) {
      toast({ title: getApiError(e)?.message ?? tc("save"), tone: "error" });
    }
  }

  return (
    <>
      <PageHeader
        title={tp("title")}
        description={tp("description")}
        actions={
          <Button variant="primary" onClick={() => url.set({ new: 1 })}>
            <Plus aria-hidden="true" />
            {t("add.open")}
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label={t("stateTabs")} className="flex gap-1 overflow-x-auto border-b border-line md:border-0">
          {STATES.map((state) => (
            <button
              key={state}
              type="button"
              aria-current={tab === state ? "page" : undefined}
              onClick={() => url.set({ state: state === "all" ? undefined : state })}
              className={cn(
                "relative h-10 shrink-0 px-3 text-body whitespace-nowrap text-graphite hover:text-ink",
                tab === state && "font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-cyan",
              )}
            >
              {t(`states.${state}`)}
              {data ? <span className="tabular ms-1.5 text-caption text-graphite">{data.counts[state]}</span> : null}
            </button>
          ))}
        </nav>
        <SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} value={q} onSearch={setQ} className="md:w-72" />
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-sm" />
          ))}
        </div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        q || tab !== "all" ? (
          <EmptyState title={t("noResults")} action={<Button variant="secondary" onClick={() => { setQ(""); url.set({ state: undefined }); }}>{tc("clearAll")}</Button>} />
        ) : (
          <EmptyState
            icon={<BookOpenText strokeWidth={1.5} />}
            title={t("empty")}
            description={t("emptyHint")}
            action={<Button variant="primary" onClick={() => url.set({ new: 1 })}>{t("add.open")}</Button>}
          />
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((course) => (
            <li key={course.id} className="flex">
              <div className="flex w-full flex-col [&>article]:flex-1">
                <CourseCard
                  course={course}
                  onArchive={(c) => setConfirm({ kind: "archive", course: c })}
                  onRestore={async (c) => {
                    await archive({ id: c.id, archived: false }).unwrap();
                    toast({ title: t("restored"), description: c.title[locale] });
                  }}
                  onDelete={(c) => setConfirm({ kind: "delete", course: c })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddCourseDialog open={adding} onOpenChange={(open) => url.set({ new: open ? 1 : undefined })} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.kind === "delete" ? t("deleteTitle") : t("archiveTitle")}
        description={
          confirm?.kind === "delete"
            ? t("deleteDescription", { title: confirm.course.title[locale] })
            : t("archiveDescription", { title: confirm?.course.title[locale] ?? "" })
        }
        confirmLabel={confirm?.kind === "delete" ? t("card.delete") : t("card.archive")}
        destructive
        loading={archiveState.isLoading || removeState.isLoading}
        onConfirm={runConfirm}
      />
    </>
  );
}

import { useLocale } from "use-intl";
import type { SelectOption } from "~/components/ui/select";
import type { Locale } from "~/domain/types";
import { useGetCourseSessionsQuery, useGetCoursesQuery } from "./api";

/** Course options for filters (Students, Payments). */
export function useCourseOptions(): SelectOption[] {
  const locale = useLocale() as Locale;
  const { data } = useGetCoursesQuery({});
  return (data?.items ?? []).map((c) => ({ value: c.id, label: `${c.code} · ${c.title[locale]}` }));
}

/** Session options of one course (dependent filter, DSH-STU-03). */
export function useSessionOptions(courseId: string | undefined): SelectOption[] {
  const { data } = useGetCourseSessionsQuery(courseId ?? "", { skip: !courseId });
  return (data ?? []).map((s) => ({ value: s.id, label: s.code }));
}

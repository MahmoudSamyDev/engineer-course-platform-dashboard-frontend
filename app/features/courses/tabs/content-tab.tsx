import { useState } from "react";
import { useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail } from "~/domain/api";
import { MIN_OUTCOMES } from "~/domain/course-rules";
import { listToText, textToList } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useUpdateCourseMutation } from "../api";

/** Content tab: the course page text on the Website (DSH-CRS-04). Lists are one item per line. */
export function ContentTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("course.content");
  const tc = useTranslations("common");
  const toast = useToast();
  const [update, { isLoading }] = useUpdateCourseMutation();
  const [error, setError] = useState<string | null>(null);
  const { draft, patch, dirty, reset } = useDraft({
    about: course.about,
    audience: course.audience,
    problemSolved: course.problemSolved,
    expectations: course.expectations,
    outcomes: listToText(course.outcomes),
    requirements: listToText(course.requirements),
    whatToBring: listToText(course.whatToBring),
  });

  async function save() {
    setError(null);
    try {
      await update({
        id: course.id,
        about: draft.about,
        audience: draft.audience,
        problemSolved: draft.problemSolved,
        expectations: draft.expectations,
        outcomes: textToList(draft.outcomes),
        requirements: textToList(draft.requirements),
        whatToBring: textToList(draft.whatToBring),
      }).unwrap();
      toast({ title: tc("saved") });
    } catch (e) {
      setError(getApiError(e)?.message ?? tc("saveFailed"));
    }
  }

  const perLine = t("perLine");
  return (
    <SectionForm dirty={dirty} saving={isLoading} onSave={save} onDiscard={reset} error={error}>
      <BilingualField label={t("about")} hint={t("aboutHint")} value={draft.about} onChange={(about) => patch({ about })} multiline rows={6} required />
      <BilingualField label={t("outcomes")} hint={`${perLine} ${t("outcomesHint", { min: MIN_OUTCOMES })}`} value={draft.outcomes} onChange={(outcomes) => patch({ outcomes })} multiline rows={5} required />
      <BilingualField label={t("audience")} value={draft.audience} onChange={(audience) => patch({ audience })} multiline rows={3} />
      <BilingualField label={t("problemSolved")} value={draft.problemSolved} onChange={(problemSolved) => patch({ problemSolved })} multiline rows={3} />
      <BilingualField label={t("expectations")} value={draft.expectations} onChange={(expectations) => patch({ expectations })} multiline rows={3} />
      <BilingualField label={t("requirements")} hint={perLine} value={draft.requirements} onChange={(requirements) => patch({ requirements })} multiline rows={4} />
      <BilingualField label={t("whatToBring")} hint={perLine} value={draft.whatToBring} onChange={(whatToBring) => patch({ whatToBring })} multiline rows={3} />
    </SectionForm>
  );
}

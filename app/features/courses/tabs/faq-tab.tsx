import { useState } from "react";
import { useTranslations } from "use-intl";
import { OrderedListEditor } from "~/components/ordered-list-editor";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail, FaqInput } from "~/domain/api";
import { emptyText } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useReplaceFaqMutation } from "../api";

/** FAQ tab: course questions shown on the course page (DSH-CRS-04). */
export function FaqTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("course.faq");
  const tc = useTranslations("common");
  const toast = useToast();
  const [replace, { isLoading }] = useReplaceFaqMutation();
  const [error, setError] = useState<string | null>(null);
  const { draft, setDraft, dirty, reset } = useDraft<FaqInput[]>(course.faq);

  async function save() {
    const complete = (v: { ar: string; en: string }) => v.ar.trim() && v.en.trim();
    if (draft.some((f) => !complete(f.question) || !complete(f.answer)))
      return setError(t("incomplete"));
    setError(null);
    try {
      await replace({ id: course.id, faq: draft }).unwrap();
      toast({ title: tc("saved") });
    } catch (e) {
      setError(getApiError(e)?.message ?? tc("saveFailed"));
    }
  }

  return (
    <SectionForm dirty={dirty} saving={isLoading} onSave={save} onDiscard={reset} error={error}>
      <OrderedListEditor
        items={draft}
        onChange={setDraft}
        itemLabel={(i) => t("question", { order: i + 1 })}
        createItem={() => ({ question: emptyText(), answer: emptyText() })}
        addLabel={t("add")}
        emptyText={t("empty")}
        renderItem={(item, update) => (
          <>
            <BilingualField
              label={t("questionLabel")}
              value={item.question}
              onChange={(question) => update({ ...item, question })}
              maxLength={160}
              required
            />
            <BilingualField
              label={t("answer")}
              value={item.answer}
              onChange={(answer) => update({ ...item, answer })}
              multiline
              rows={3}
              required
            />
          </>
        )}
      />
    </SectionForm>
  );
}

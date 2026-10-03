import { useState } from "react";
import { useTranslations } from "use-intl";
import { OrderedListEditor } from "~/components/ordered-list-editor";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail } from "~/domain/api";
import type { LocalizedText } from "~/domain/types";
import { emptyText, listToText, textToList } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useReplaceModulesMutation } from "../api";

type ModuleDraft = { title: LocalizedText; durationHours: number | null; topics: LocalizedText };

/** Curriculum tab: ordered modules with hours and topics (DSH-CRS-04). */
export function CurriculumTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("course.curriculum");
  const tc = useTranslations("common");
  const toast = useToast();
  const [replace, { isLoading }] = useReplaceModulesMutation();
  const [error, setError] = useState<string | null>(null);
  const { draft, setDraft, dirty, reset } = useDraft<ModuleDraft[]>(
    course.modules.map((m) => ({
      title: m.title,
      durationHours: m.durationHours ?? null,
      topics: listToText(m.topics),
    })),
  );
  const totalHours = draft.reduce((sum, m) => sum + (m.durationHours ?? 0), 0);

  async function save() {
    if (draft.some((m) => !m.title.ar.trim() || !m.title.en.trim()))
      return setError(t("titleError"));
    setError(null);
    try {
      await replace({
        id: course.id,
        modules: draft.map((m) => ({
          title: m.title,
          durationHours: m.durationHours ?? undefined,
          topics: textToList(m.topics),
        })),
      }).unwrap();
      toast({ title: tc("saved") });
    } catch (e) {
      setError(getApiError(e)?.message ?? tc("saveFailed"));
    }
  }

  return (
    <SectionForm dirty={dirty} saving={isLoading} onSave={save} onDiscard={reset} error={error}>
      <p className="text-body text-graphite">
        {t("summary", { count: draft.length, hours: totalHours, planned: course.totalHours })}
      </p>
      <OrderedListEditor
        items={draft}
        onChange={setDraft}
        itemLabel={(i) => t("module", { order: i + 1 })}
        createItem={() => ({ title: emptyText(), durationHours: null, topics: emptyText() })}
        addLabel={t("add")}
        emptyText={t("empty")}
        renderItem={(module, update) => (
          <>
            <BilingualField
              label={t("title")}
              value={module.title}
              onChange={(title) => update({ ...module, title })}
              maxLength={100}
              required
            />
            <Field label={t("hours")} className="sm:max-w-40">
              {(control) => (
                <Input
                  {...control}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  dir="ltr"
                  value={module.durationHours ?? ""}
                  onChange={(e) =>
                    update({
                      ...module,
                      durationHours: Number.isNaN(e.target.valueAsNumber)
                        ? null
                        : e.target.valueAsNumber,
                    })
                  }
                />
              )}
            </Field>
            <BilingualField
              label={t("topics")}
              hint={t("perLine")}
              value={module.topics}
              onChange={(topics) => update({ ...module, topics })}
              multiline
              rows={4}
            />
          </>
        )}
      />
    </SectionForm>
  );
}

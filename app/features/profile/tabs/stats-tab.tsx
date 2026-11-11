import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { InstructorProfile, InstructorStatDto } from "~/domain/api";
import { filledBoth, PROFILE_LIMITS } from "~/domain/profile-rules";
import { emptyText } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { missingIn, useProfileSave } from "../use-profile-save";

const STAT_KEYS: InstructorStatDto["key"][] = ["years", "students", "cohorts", "projects"];

/** Always the four hero stats, in the order the Website shows them. */
function fourStats(stats: InstructorStatDto[]): InstructorStatDto[] {
  return STAT_KEYS.map(
    (key) => stats.find((stat) => stat.key === key) ?? { key, value: "", label: emptyText() },
  );
}

/** Stats: the four hero numbers with a truthful-claims notice (DSH-PRO-05, DBR-17). */
export function StatsTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.stats");
  const tp = useTranslations("profile");
  const { save, saving, error, setError } = useProfileSave();
  const [attempted, setAttempted] = useState(false);
  const { draft, setDraft, dirty, reset } = useDraft(fourStats(profile.stats));
  const update = (index: number, changes: Partial<InstructorStatDto>) =>
    setDraft(draft.map((stat, i) => (i === index ? { ...stat, ...changes } : stat)));

  async function submit() {
    setAttempted(true);
    if (!draft.every((stat) => stat.value.trim() && filledBoth(stat.label)))
      return setError(t("incomplete"));
    const ok = await save({ stats: draft.map((s) => ({ ...s, value: s.value.trim() })) });
    if (ok) setAttempted(false);
  }

  return (
    <SectionForm
      dirty={dirty}
      saving={saving}
      onSave={submit}
      onDiscard={() => {
        reset();
        setAttempted(false);
        setError(null);
      }}
      error={error}
    >
      <div
        role="note"
        className="flex gap-3 rounded-sm bg-warning-wash px-3 py-2.5 text-body text-warning"
      >
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>{t("truthful")}</p>
      </div>
      <ol className="grid gap-6">
        {draft.map((stat, index) => (
          <li
            key={stat.key}
            className="grid gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0 md:grid-cols-[10rem_1fr]"
          >
            <Field
              label={t(`keys.${stat.key}`)}
              hint={t("valueHint")}
              error={attempted && !stat.value.trim() ? t("valueMissing") : undefined}
              required
            >
              {(control) => (
                <Input
                  {...control}
                  dir="ltr"
                  value={stat.value}
                  maxLength={PROFILE_LIMITS.statValue}
                  onChange={(e) => update(index, { value: e.target.value })}
                  className="tabular"
                />
              )}
            </Field>
            <BilingualField
              label={t("label")}
              value={stat.label}
              onChange={(label) => update(index, { label })}
              maxLength={PROFILE_LIMITS.statLabel}
              errors={missingIn(stat.label, attempted, tp("fillBoth"))}
              required
            />
          </li>
        ))}
      </ol>
    </SectionForm>
  );
}

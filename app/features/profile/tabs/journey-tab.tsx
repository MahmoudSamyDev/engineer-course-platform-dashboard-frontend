import { useState } from "react";
import { useTranslations } from "use-intl";
import { OrderedListEditor } from "~/components/ordered-list-editor";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toast";
import type { InstructorProfile, MilestoneDto } from "~/domain/api";
import {
  checkYears,
  EARLIEST_YEAR,
  filledBoth,
  milestoneEnd,
  PROFILE_LIMITS,
  type MilestoneEnd,
} from "~/domain/profile-rules";
import type { MilestoneType } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { emptyText } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useReplaceJourneyMutation } from "../api";

const TYPES: MilestoneType[] = ["EDUCATION", "ENGINEERING", "TEACHING", "MILESTONE"];
const ENDS: MilestoneEnd[] = ["range", "present", "single"];

/** The end year that matches a chosen end mode (keeps a typed year when switching back). */
function endYearFor(mode: MilestoneEnd, milestone: MilestoneDto, year: number) {
  if (mode === "present") return null;
  if (mode === "single") return undefined;
  return typeof milestone.endYear === "number" ? milestone.endYear : year;
}

function problemOf(milestone: MilestoneDto, year: number) {
  if (!filledBoth(milestone.title)) return "title";
  if (!filledBoth(milestone.organization)) return "organization";
  return checkYears(milestone.startYear, milestone.endYear, year);
}

/** Journey: education, engineering and teaching milestones; end ≥ start (DSH-PRO-07). */
export function JourneyTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.journey");
  const tc = useTranslations("common");
  const toast = useToast();
  const [replace, { isLoading }] = useReplaceJourneyMutation();
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const { draft, setDraft, dirty, reset } = useDraft(profile.journey);
  const year = appNow().getFullYear();

  async function submit() {
    setAttempted(true);
    const bad = draft.findIndex((milestone) => problemOf(milestone, year));
    if (bad >= 0) return setError(t("invalid", { order: bad + 1 }));
    setError(null);
    try {
      await replace(draft).unwrap();
      toast({ title: tc("saved") });
      setAttempted(false);
    } catch (e) {
      setError(getApiError(e)?.message ?? tc("saveFailed"));
    }
  }

  return (
    <SectionForm
      dirty={dirty}
      saving={isLoading}
      onSave={submit}
      onDiscard={() => {
        reset();
        setAttempted(false);
        setError(null);
      }}
      error={error}
    >
      <p className="text-body text-graphite">{t("intro")}</p>
      <OrderedListEditor
        items={draft}
        onChange={setDraft}
        itemLabel={(i) => t("item", { order: i + 1 })}
        createItem={(): MilestoneDto => ({
          id: crypto.randomUUID(),
          type: "ENGINEERING",
          startYear: year,
          endYear: null,
          title: emptyText(),
          organization: emptyText(),
          description: emptyText(),
        })}
        addLabel={t("add")}
        emptyText={t("empty")}
        renderItem={(milestone, update) => {
          const problem = attempted ? problemOf(milestone, year) : null;
          const end = milestoneEnd(milestone.endYear);
          const yearError =
            problem === "endBeforeStart"
              ? t("errors.endBeforeStart")
              : problem === "startYear" || problem === "endYear"
                ? t("errors.year", { min: EARLIEST_YEAR, max: year })
                : undefined;
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label={t("type")} required>
                  {(control) => (
                    <Select
                      {...control}
                      value={milestone.type}
                      onValueChange={(v) => v && update({ ...milestone, type: v as MilestoneType })}
                      options={TYPES.map((type) => ({ value: type, label: t(`types.${type}`) }))}
                    />
                  )}
                </Field>
                <Field
                  label={t("startYear")}
                  error={problem === "startYear" ? yearError : undefined}
                  required
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="number"
                      inputMode="numeric"
                      dir="ltr"
                      min={EARLIEST_YEAR}
                      max={year}
                      value={Number.isNaN(milestone.startYear) ? "" : milestone.startYear}
                      onChange={(e) => update({ ...milestone, startYear: e.target.valueAsNumber })}
                      className="tabular"
                    />
                  )}
                </Field>
                <Field label={t("end")} required>
                  {(control) => (
                    <Select
                      {...control}
                      value={end}
                      onValueChange={(v) =>
                        v &&
                        update({
                          ...milestone,
                          endYear: endYearFor(v as MilestoneEnd, milestone, year),
                        })
                      }
                      options={ENDS.map((mode) => ({ value: mode, label: t(`ends.${mode}`) }))}
                    />
                  )}
                </Field>
                {end === "range" ? (
                  <Field
                    label={t("endYear")}
                    error={problem && problem !== "startYear" ? yearError : undefined}
                    required
                  >
                    {(control) => (
                      <Input
                        {...control}
                        type="number"
                        inputMode="numeric"
                        dir="ltr"
                        min={EARLIEST_YEAR}
                        max={year}
                        value={
                          typeof milestone.endYear === "number" && !Number.isNaN(milestone.endYear)
                            ? milestone.endYear
                            : ""
                        }
                        onChange={(e) => update({ ...milestone, endYear: e.target.valueAsNumber })}
                        className="tabular"
                      />
                    )}
                  </Field>
                ) : null}
              </div>
              <BilingualField
                label={t("title")}
                value={milestone.title}
                onChange={(title) => update({ ...milestone, title })}
                maxLength={PROFILE_LIMITS.milestoneTitle}
                errors={problem === "title" ? { ar: t("errors.title") } : undefined}
                required
              />
              <BilingualField
                label={t("organization")}
                value={milestone.organization}
                onChange={(organization) => update({ ...milestone, organization })}
                maxLength={PROFILE_LIMITS.milestoneOrganization}
                errors={problem === "organization" ? { ar: t("errors.organization") } : undefined}
                required
              />
              <BilingualField
                label={t("description")}
                value={milestone.description}
                onChange={(description) => update({ ...milestone, description })}
                multiline
                rows={2}
                maxLength={PROFILE_LIMITS.milestoneDescription}
              />
            </>
          );
        }}
      />
    </SectionForm>
  );
}

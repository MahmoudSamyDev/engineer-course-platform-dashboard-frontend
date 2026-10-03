import { Lock } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail } from "~/domain/api";
import { COURSE_CODE_PATTERN, SLUG_PATTERN } from "~/domain/course-rules";
import { egpToPiasters, piastersToEgp } from "~/domain/money";
import type { CourseLevel } from "~/domain/types";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useUpdateCourseMutation } from "../api";

const LEVELS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

/** Overview tab: essentials, link, price, cover (DSH-CRS-04; DBR-02/03 locks). */
export function OverviewTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("course.overview");
  const tl = useTranslations("courses.levels");
  const ta = useTranslations("courses.add");
  const tc = useTranslations("common");
  const toast = useToast();
  const [update, { isLoading }] = useUpdateCourseMutation();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { draft, patch, dirty, reset } = useDraft({
    title: course.title,
    code: course.code,
    slug: course.slug,
    level: course.level,
    price: piastersToEgp(course.basePrice),
    totalHours: course.totalHours,
    meetingsCount: course.meetingsCount,
    shortDescription: course.shortDescription,
    coverDiscipline: course.coverDiscipline,
    coverAlt: course.coverAlt,
  });

  async function save() {
    const errors: Record<string, string> = {};
    if (!draft.title.ar.trim() || !draft.title.en.trim()) errors.title = ta("errors.both");
    if (!COURSE_CODE_PATTERN.test(draft.code)) errors.code = ta("errors.code");
    if (!SLUG_PATTERN.test(draft.slug)) errors.slug = ta("errors.slug");
    if (!(draft.price > 0)) errors.price = ta("errors.price");
    if (!(draft.totalHours > 0)) errors.totalHours = ta("errors.hours");
    if (!(draft.meetingsCount > 0)) errors.meetingsCount = ta("errors.meetings");
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setError(null);
    try {
      const { price, ...rest } = draft;
      await update({
        id: course.id,
        ...rest,
        code: course.codeLocked ? undefined : draft.code,
        slug: course.slugLocked ? undefined : draft.slug,
        basePrice: egpToPiasters(price),
      }).unwrap();
      toast({ title: tc("saved") });
    } catch (e) {
      const apiError = getApiError(e);
      if (apiError?.fields?.code) setFieldErrors({ code: ta(apiError.fields.code === "TAKEN" ? "errors.codeTaken" : "errors.code") });
      else if (apiError?.fields?.slug) setFieldErrors({ slug: ta(apiError.fields.slug === "TAKEN" ? "errors.slugTaken" : "errors.slug") });
      else setError(apiError?.message ?? tc("saveFailed"));
    }
  }

  return (
    <SectionForm dirty={dirty} saving={isLoading} onSave={save} onDiscard={reset} error={error}>
      <BilingualField label={ta("titleLabel")} value={draft.title} onChange={(title) => patch({ title })} maxLength={90} required errors={fieldErrors.title ? { ar: fieldErrors.title } : undefined} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label={ta("code")}
          hint={course.codeLocked ? <span className="inline-flex items-center gap-1"><Lock aria-hidden="true" className="size-3" />{t("codeLocked")}</span> : ta("codeHint")}
          error={fieldErrors.code}
          required
        >
          {(control) => (
            <Input {...control} value={draft.code} onChange={(e) => patch({ code: e.target.value.toUpperCase() })} maxLength={3} dir="ltr" disabled={course.codeLocked} className="uppercase" />
          )}
        </Field>
        <Field
          label={ta("slug")}
          hint={course.slugLocked ? <span className="inline-flex items-center gap-1"><Lock aria-hidden="true" className="size-3" />{t("slugLocked")}</span> : ta("slugHint")}
          error={fieldErrors.slug}
          required
          className="lg:col-span-2"
        >
          {(control) => <Input {...control} value={draft.slug} onChange={(e) => patch({ slug: e.target.value })} dir="ltr" disabled={course.slugLocked} />}
        </Field>
        <Field label={ta("level")} required>
          {(control) => (
            <Select {...control} value={draft.level} onValueChange={(v) => v && patch({ level: v as CourseLevel })} options={LEVELS.map((l) => ({ value: l, label: tl(l) }))} />
          )}
        </Field>
        <Field label={ta("price")} hint={t("priceHint")} error={fieldErrors.price} required>
          {(control) => (
            <div className="relative">
              <Input {...control} type="number" inputMode="decimal" min={1} dir="ltr" value={Number.isNaN(draft.price) ? "" : draft.price} onChange={(e) => patch({ price: e.target.valueAsNumber })} className="pe-14" />
              <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-caption text-graphite">{ta("currency")}</span>
            </div>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={ta("hours")} error={fieldErrors.totalHours} required>
            {(control) => <Input {...control} type="number" inputMode="numeric" min={1} dir="ltr" value={Number.isNaN(draft.totalHours) ? "" : draft.totalHours} onChange={(e) => patch({ totalHours: e.target.valueAsNumber })} />}
          </Field>
          <Field label={ta("meetings")} error={fieldErrors.meetingsCount} required>
            {(control) => <Input {...control} type="number" inputMode="numeric" min={1} dir="ltr" value={Number.isNaN(draft.meetingsCount) ? "" : draft.meetingsCount} onChange={(e) => patch({ meetingsCount: e.target.valueAsNumber })} />}
          </Field>
        </div>
      </div>
      <BilingualField label={ta("shortDescription")} hint={ta("shortDescriptionHint")} value={draft.shortDescription} onChange={(shortDescription) => patch({ shortDescription })} multiline rows={3} maxLength={180} required />
      <div className="grid gap-6 border-t border-line pt-6">
        <h3 className="text-subheading font-semibold">{t("cover")}</h3>
        <BilingualField label={t("discipline")} hint={t("disciplineHint")} value={draft.coverDiscipline} onChange={(coverDiscipline) => patch({ coverDiscipline })} maxLength={40} />
        <BilingualField label={t("coverAlt")} hint={t("coverAltHint")} value={draft.coverAlt} onChange={(coverAlt) => patch({ coverAlt })} maxLength={120} required />
      </div>
    </SectionForm>
  );
}

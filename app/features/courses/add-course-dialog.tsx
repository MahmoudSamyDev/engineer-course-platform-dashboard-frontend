import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { useDiscardGuard } from "~/components/use-discard-guard";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toast";
import { COURSE_CODE_PATTERN, slugify, SLUG_PATTERN } from "~/domain/course-rules";
import { egpToPiasters } from "~/domain/money";
import { getApiError } from "~/store/api";
import { useCreateCourseMutation } from "./api";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const text = z.object({ ar: z.string().trim(), en: z.string().trim() });

const schema = z.object({
  title: text.refine((v) => v.ar && v.en, "both"),
  code: z.string().trim().toUpperCase().regex(COURSE_CODE_PATTERN, "code"),
  slug: z.string().trim().regex(SLUG_PATTERN, "slug"),
  level: z.enum(LEVELS),
  price: z.number({ error: "price" }).positive("price").max(100_000, "price"),
  totalHours: z.number({ error: "hours" }).int("hours").positive("hours").max(500, "hours"),
  meetingsCount: z.number({ error: "meetings" }).int("meetings").positive("meetings").max(60, "meetings"),
  shortDescription: text,
});
type Values = z.infer<typeof schema>;

/**
 * Add course (DSH-CRS-03): essentials only, saved as a Draft, then the details page opens
 * so the rest can be completed tab by tab.
 */
export function AddCourseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("courses.add");
  const tc = useTranslations("common");
  const tl = useTranslations("courses.levels");
  const toast = useToast();
  const navigate = useNavigate();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      title: { ar: "", en: "" },
      code: "",
      slug: "",
      level: "BEGINNER",
      shortDescription: { ar: "", en: "" },
    },
  });
  const { errors, isDirty } = form.formState;
  const slugEdited = useRef(false);
  const close = () => {
    form.reset();
    slugEdited.current = false;
    onOpenChange(false);
  };
  const { requestClose, guard } = useDiscardGuard(isDirty, close);

  // Suggest the link from the English title until the user edits it (DSH-CRS-03).
  const titleEn = form.watch("title.en");
  useEffect(() => {
    if (!slugEdited.current) form.setValue("slug", slugify(titleEn ?? ""), { shouldValidate: false });
  }, [titleEn, form]);

  async function submit(values: Values) {
    try {
      const course = await createCourse({
        title: values.title,
        code: values.code,
        slug: values.slug,
        level: values.level,
        basePrice: egpToPiasters(values.price),
        totalHours: values.totalHours,
        meetingsCount: values.meetingsCount,
        shortDescription: values.shortDescription,
      }).unwrap();
      toast({ title: t("done"), description: values.title.en });
      close();
      navigate(`/courses/${course.id}`);
    } catch (error) {
      const fields = getApiError(error)?.fields ?? {};
      if (fields.code) form.setError("code", { message: fields.code === "TAKEN" ? "codeTaken" : "code" });
      if (fields.slug) form.setError("slug", { message: fields.slug === "TAKEN" ? "slugTaken" : "slug" });
      if (!Object.keys(fields).length) toast({ title: tc("save"), description: getApiError(error)?.message, tone: "error" });
    }
  }

  const message = (key: string | undefined) => (key ? t(`errors.${key as "code"}`) : undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      onRequestClose={requestClose}
      title={t("title")}
      description={t("description")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => requestClose() && close()}>
            {tc("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="add-course" loading={isLoading}>
            {t("submit")}
          </Button>
        </>
      }
    >
      <form id="add-course" noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <BilingualField
              label={t("titleLabel")}
              value={field.value}
              onChange={field.onChange}
              maxLength={90}
              required
              errors={errors.title ? { ar: !field.value.ar ? t("errors.both") : undefined, en: !field.value.en ? t("errors.both") : undefined } : undefined}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("code")} hint={t("codeHint")} error={message(errors.code?.message)} required>
            {(control) => (
              <Input {...control} {...form.register("code", { onChange: (e) => (e.target.value = e.target.value.toUpperCase()) })} maxLength={3} dir="ltr" autoComplete="off" className="uppercase" />
            )}
          </Field>
          <Field label={t("slug")} hint={t("slugHint")} error={message(errors.slug?.message)} required>
            {(control) => (
              <Input {...control} {...form.register("slug", { onChange: () => (slugEdited.current = true) })} dir="ltr" autoComplete="off" />
            )}
          </Field>
          <Field label={t("level")} required>
            {(control) => (
              <Controller
                control={form.control}
                name="level"
                render={({ field }) => (
                  <Select {...control} value={field.value} onValueChange={(v) => v && field.onChange(v)} options={LEVELS.map((l) => ({ value: l, label: tl(l) }))} />
                )}
              />
            )}
          </Field>
          <Field label={t("price")} hint={t("priceHint")} error={message(errors.price?.message)} required>
            {(control) => (
              <div className="relative">
                <Input {...control} {...form.register("price", { valueAsNumber: true })} type="number" inputMode="decimal" min={1} dir="ltr" className="pe-14" />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-caption text-graphite">{t("currency")}</span>
              </div>
            )}
          </Field>
          <Field label={t("hours")} error={message(errors.totalHours?.message)} required>
            {(control) => <Input {...control} {...form.register("totalHours", { valueAsNumber: true })} type="number" inputMode="numeric" min={1} dir="ltr" />}
          </Field>
          <Field label={t("meetings")} error={message(errors.meetingsCount?.message)} required>
            {(control) => <Input {...control} {...form.register("meetingsCount", { valueAsNumber: true })} type="number" inputMode="numeric" min={1} dir="ltr" />}
          </Field>
        </div>
        <Controller
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <BilingualField label={t("shortDescription")} hint={t("shortDescriptionHint")} value={field.value} onChange={field.onChange} multiline rows={3} maxLength={180} />
          )}
        />
      </form>
      {guard}
    </Dialog>
  );
}

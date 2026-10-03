import { CircleAlert, CircleCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Button } from "~/components/ui/button";
import { SwitchField } from "~/components/ui/switch";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail, ReadinessIssue } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useUpdateCourseMutation } from "../api";
import { websiteCourseUrl } from "../website-url";

/** Which tab fixes each missing item (DSH-CRS-05). */
const FIXED_IN: Record<ReadinessIssue, "overview" | "content" | "curriculum"> = {
  title: "overview",
  shortDescription: "overview",
  totalHours: "overview",
  meetingsCount: "overview",
  basePrice: "overview",
  coverAlt: "overview",
  about: "content",
  outcomes: "content",
  modules: "curriculum",
};

/** Publishing tab: readiness checklist, visibility switches and SEO (DSH-CRS-05, DBR-04). */
export function PublishingTab({ course }: { course: CourseDetail }) {
  const t = useTranslations("course.publishing");
  const tc = useTranslations("common");
  const toast = useToast();
  const locale = useLocale() as Locale;
  const [, setParams] = useSearchParams();
  const [update, { isLoading }] = useUpdateCourseMutation();
  const [error, setError] = useState<string | null>(null);
  const ready = course.readiness.length === 0;

  const { draft, patch, dirty, reset } = useDraft({
    isFeatured: course.isFeatured,
    isComingSoon: course.isComingSoon,
    comingSoonNote: course.comingSoonNote,
    registrationClosed: course.registrationClosed,
    seo: course.seo,
  });

  async function save(extra: { isPublished?: boolean } = {}) {
    setError(null);
    try {
      await update({ id: course.id, ...draft, ...extra }).unwrap();
      toast({
        title:
          extra.isPublished === true
            ? t("published")
            : extra.isPublished === false
              ? t("unpublished")
              : tc("saved"),
      });
    } catch (e) {
      const apiError = getApiError(e);
      setError(
        apiError?.code === "CONFLICT" ? t("blocked") : (apiError?.message ?? tc("saveFailed")),
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="readiness"
        className={`rounded-sm border p-4 sm:p-6 ${ready ? "border-success/30 bg-success-wash" : "border-warning/30 bg-warning-wash"}`}
      >
        <h3
          id="readiness"
          className="flex items-center gap-2 font-display text-subheading font-semibold"
        >
          {ready ? (
            <CircleCheck aria-hidden="true" className="size-5 text-success" />
          ) : (
            <CircleAlert aria-hidden="true" className="size-5 text-warning" />
          )}
          {ready ? t("readyTitle") : t("notReadyTitle", { count: course.readiness.length })}
        </h3>
        <p className="mt-1 text-body text-ink">{ready ? t("readyHint") : t("notReadyHint")}</p>

        {!ready ? (
          <ul className="mt-3 flex flex-col gap-1.5">
            {course.readiness.map((issue) => (
              <li key={issue} className="flex flex-wrap items-center gap-2 text-body">
                <span aria-hidden="true" className="size-1.5 shrink-0 bg-warning" />
                {t(`missing.${issue}`)}
                <button
                  type="button"
                  onClick={() =>
                    setParams(
                      (prev) => {
                        const next = new URLSearchParams(prev);
                        next.set("tab", FIXED_IN[issue]);
                        return next;
                      },
                      { replace: true },
                    )
                  }
                  className="text-caption font-medium text-cyan hover:underline"
                >
                  {t("fixIn", { tab: t(`tabs.${FIXED_IN[issue]}`) })}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {course.state === "PUBLISHED" ? (
            <>
              <Button
                variant="secondary"
                loading={isLoading}
                onClick={() => save({ isPublished: false })}
              >
                {t("unpublishAction")}
              </Button>
              <Button asChild variant="ghost">
                <a href={websiteCourseUrl(course.slug, locale)} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                  {t("viewOnWebsite")}
                </a>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              disabled={!ready || course.state === "ARCHIVED"}
              loading={isLoading}
              onClick={() => save({ isPublished: true })}
            >
              {t("publishAction")}
            </Button>
          )}
        </div>
        {course.state === "ARCHIVED" ? (
          <p className="mt-2 text-caption text-graphite">{t("archivedHint")}</p>
        ) : null}
      </section>

      <SectionForm
        dirty={dirty}
        saving={isLoading}
        onSave={() => save()}
        onDiscard={reset}
        error={error}
      >
        <div className="divide-y divide-line">
          <SwitchField
            label={t("featured")}
            hint={t("featuredHint")}
            checked={draft.isFeatured}
            onCheckedChange={(isFeatured) => patch({ isFeatured })}
          />
          <SwitchField
            label={t("comingSoon")}
            hint={t("comingSoonHint")}
            checked={draft.isComingSoon}
            onCheckedChange={(isComingSoon) => patch({ isComingSoon })}
          />
          <SwitchField
            label={t("registrationClosed")}
            hint={t("registrationClosedHint")}
            checked={draft.registrationClosed}
            onCheckedChange={(registrationClosed) => patch({ registrationClosed })}
          />
        </div>

        {draft.isComingSoon ? (
          <BilingualField
            label={t("comingSoonNote")}
            hint={t("comingSoonNoteHint")}
            value={draft.comingSoonNote}
            onChange={(comingSoonNote) => patch({ comingSoonNote })}
            maxLength={120}
          />
        ) : null}

        <div className="flex flex-col gap-5 border-t border-line pt-6">
          <h3 className="text-subheading font-semibold">{t("seo")}</h3>
          <BilingualField
            label={t("seoTitle")}
            hint={t("seoTitleHint")}
            value={draft.seo.title}
            onChange={(title) => patch({ seo: { ...draft.seo, title } })}
            maxLength={60}
          />
          <BilingualField
            label={t("seoDescription")}
            hint={t("seoDescriptionHint")}
            value={draft.seo.description}
            onChange={(description) => patch({ seo: { ...draft.seo, description } })}
            multiline
            rows={3}
            maxLength={160}
          />
        </div>
      </SectionForm>
    </div>
  );
}

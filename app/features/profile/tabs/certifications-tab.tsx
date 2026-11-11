import { useState } from "react";
import { useTranslations } from "use-intl";
import { OrderedListEditor } from "~/components/ordered-list-editor";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { Field } from "~/components/ui/field";
import { ImagePicker } from "~/components/ui/image-picker";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toast";
import type { CertificationDto, InstructorProfile } from "~/domain/api";
import {
  checkYears,
  EARLIEST_YEAR,
  filledBoth,
  isOptionalHttpsUrl,
  PROFILE_LIMITS,
} from "~/domain/profile-rules";
import { maxMegabytes } from "~/domain/uploads";
import { useImageUpload } from "~/features/uploads/use-image-upload";
import { appNow } from "~/lib/clock";
import { emptyText } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useReplaceCertificationsMutation } from "../api";

/** Which part of a certification is wrong, in the order the form shows it. */
function problemOf(cert: CertificationDto, year: number) {
  if (!filledBoth(cert.name)) return "name";
  if (!filledBoth(cert.issuer)) return "issuer";
  if (checkYears(cert.year, undefined, year)) return "year";
  if (!isOptionalHttpsUrl(cert.credentialUrl)) return "url";
  return null;
}

/** Certifications: add, edit, reorder, delete (DSH-PRO-06). No placeholder values (DBR-17). */
export function CertificationsTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.certifications");
  const tc = useTranslations("common");
  const toast = useToast();
  const [replace, { isLoading }] = useReplaceCertificationsMutation();
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const { draft, setDraft, dirty, reset } = useDraft(profile.certifications);
  const year = appNow().getFullYear();

  async function submit() {
    setAttempted(true);
    const bad = draft.findIndex((cert) => problemOf(cert, year));
    if (bad >= 0) return setError(t("invalid", { order: bad + 1 }));
    setError(null);
    try {
      await replace(
        draft.map((cert) => ({ ...cert, credentialUrl: cert.credentialUrl?.trim() || null })),
      ).unwrap();
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
        createItem={() => ({
          id: crypto.randomUUID(),
          name: emptyText(),
          issuer: emptyText(),
          year,
          credentialUrl: null,
          imageUrl: null,
        })}
        addLabel={t("add")}
        emptyText={t("empty")}
        renderItem={(cert, update) => {
          const problem = attempted ? problemOf(cert, year) : null;
          return (
            <>
              <BilingualField
                label={t("name")}
                value={cert.name}
                onChange={(name) => update({ ...cert, name })}
                maxLength={PROFILE_LIMITS.certificationName}
                errors={problem === "name" ? { ar: t("errors.name") } : undefined}
                required
              />
              <BilingualField
                label={t("issuer")}
                value={cert.issuer}
                onChange={(issuer) => update({ ...cert, issuer })}
                maxLength={PROFILE_LIMITS.certificationIssuer}
                errors={problem === "issuer" ? { ar: t("errors.issuer") } : undefined}
                required
              />
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <Field
                  label={t("year")}
                  error={
                    problem === "year"
                      ? t("errors.year", { min: EARLIEST_YEAR, max: year })
                      : undefined
                  }
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
                      value={Number.isNaN(cert.year) ? "" : cert.year}
                      onChange={(e) => update({ ...cert, year: e.target.valueAsNumber })}
                      className="tabular"
                    />
                  )}
                </Field>
                <Field
                  label={t("url")}
                  hint={t("urlHint")}
                  error={problem === "url" ? t("errors.url") : undefined}
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="url"
                      inputMode="url"
                      dir="ltr"
                      placeholder="https://"
                      value={cert.credentialUrl ?? ""}
                      onChange={(e) => update({ ...cert, credentialUrl: e.target.value })}
                    />
                  )}
                </Field>
              </div>
              <CertificateImage
                src={cert.imageUrl}
                alt={cert.name.en}
                onChange={(imageUrl) => update({ ...cert, imageUrl })}
              />
            </>
          );
        }}
      />
    </SectionForm>
  );
}

/** Each certificate uploads its own image, so each needs its own upload state. */
function CertificateImage({
  src,
  alt,
  onChange,
}: {
  src: string | null;
  alt: string;
  onChange: (url: string | null) => void;
}) {
  const t = useTranslations("profile.certifications");
  const upload = useImageUpload("certification");
  return (
    <ImagePicker
      label={t("image")}
      shape="landscape"
      src={src}
      previewAlt={alt}
      hint={t("imageHint", { max: maxMegabytes("certification") })}
      error={upload.error}
      uploading={upload.uploading}
      onSelect={async (file) => {
        const url = await upload.uploadFile(file);
        if (url) onChange(url);
      }}
      onRemove={() => {
        upload.clearError();
        onChange(null);
      }}
    />
  );
}

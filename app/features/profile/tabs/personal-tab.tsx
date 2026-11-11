import { useState } from "react";
import { useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import { ImagePicker } from "~/components/ui/image-picker";
import type { InstructorProfile } from "~/domain/api";
import { filledBoth, PROFILE_LIMITS } from "~/domain/profile-rules";
import { maxMegabytes, UPLOAD_RULES } from "~/domain/uploads";
import { useImageUpload } from "~/features/uploads/use-image-upload";
import { useDraft } from "~/lib/use-draft";
import { missingIn, useProfileSave } from "../use-profile-save";

const TEXT_FIELDS = ["name", "shortName", "title", "specialization"] as const;

/** Personal: names, title, specialization and the hero photo (DSH-PRO-02, DAC-08). */
export function PersonalTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.personal");
  const tp = useTranslations("profile");
  const { save, saving, error, setError } = useProfileSave();
  const photo = useImageUpload("instructor-photo");
  const [attempted, setAttempted] = useState(false);
  const { draft, patch, dirty, reset } = useDraft({
    name: profile.name,
    shortName: profile.shortName,
    title: profile.title,
    specialization: profile.specialization,
    photoUrl: profile.photoUrl,
    photoAlt: profile.photoAlt,
  });

  async function submit() {
    setAttempted(true);
    if (![...TEXT_FIELDS, "photoAlt" as const].every((key) => filledBoth(draft[key])))
      return setError(tp("bothLanguages"));
    if (await save(draft)) setAttempted(false);
  }

  const rule = UPLOAD_RULES["instructor-photo"];
  const missing = tp("fillBoth");

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
      {TEXT_FIELDS.map((key) => (
        <BilingualField
          key={key}
          label={t(key)}
          hint={t(`${key}Hint`)}
          value={draft[key]}
          onChange={(value) => patch({ [key]: value })}
          maxLength={PROFILE_LIMITS[key]}
          errors={missingIn(draft[key], attempted, missing)}
          required
        />
      ))}
      <div className="grid gap-6 border-t border-line pt-6">
        <h3 className="text-subheading font-semibold">{t("photoSection")}</h3>
        <ImagePicker
          label={t("photo")}
          shape="portrait"
          src={draft.photoUrl}
          previewAlt={draft.photoAlt.en}
          hint={t("photoHint", {
            max: maxMegabytes("instructor-photo"),
            width: rule.minWidth ?? 0,
            height: rule.minHeight ?? 0,
          })}
          error={photo.error}
          uploading={photo.uploading}
          onSelect={async (file) => {
            const url = await photo.uploadFile(file);
            if (url) patch({ photoUrl: url });
          }}
        />
        <BilingualField
          label={t("photoAlt")}
          hint={t("photoAltHint")}
          value={draft.photoAlt}
          onChange={(photoAlt) => patch({ photoAlt })}
          maxLength={PROFILE_LIMITS.photoAlt}
          errors={missingIn(draft.photoAlt, attempted, missing)}
          required
        />
      </div>
    </SectionForm>
  );
}

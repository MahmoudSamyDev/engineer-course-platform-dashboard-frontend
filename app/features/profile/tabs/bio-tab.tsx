import { useState } from "react";
import { useTranslations } from "use-intl";
import { SectionForm } from "~/components/section-form";
import { BilingualField } from "~/components/ui/bilingual-field";
import type { InstructorProfile } from "~/domain/api";
import { filledBoth, PROFILE_LIMITS } from "~/domain/profile-rules";
import type { LocalizedText } from "~/domain/types";
import { listToText, paragraphsToText, textToList, textToParagraphs } from "~/lib/localized";
import { useDraft } from "~/lib/use-draft";
import { missingIn, useProfileSave } from "../use-profile-save";

const SHORT_FIELDS = ["positioningStatement", "valueProposition", "bioShort"] as const;

/** At least one paragraph (or line) in each language. */
const listOk = (
  text: LocalizedText,
  split: (t: LocalizedText) => { ar: string[]; en: string[] },
) => {
  const list = split(text);
  return list.ar.length > 0 && list.en.length > 0;
};

/** Bio: positioning, value proposition, short and long bio, audience — AR/EN side by side (DSH-PRO-04). */
export function BioTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.bio");
  const tp = useTranslations("profile");
  const { save, saving, error, setError } = useProfileSave();
  const [attempted, setAttempted] = useState(false);
  const { draft, patch, dirty, reset } = useDraft({
    positioningStatement: profile.positioningStatement,
    valueProposition: profile.valueProposition,
    bioShort: profile.bioShort,
    bioLong: paragraphsToText(profile.bioLong),
    audience: listToText(profile.audience),
  });

  async function submit() {
    setAttempted(true);
    const complete =
      SHORT_FIELDS.every((key) => filledBoth(draft[key])) &&
      listOk(draft.bioLong, textToParagraphs) &&
      listOk(draft.audience, textToList);
    if (!complete) return setError(tp("bothLanguages"));
    const ok = await save({
      positioningStatement: draft.positioningStatement,
      valueProposition: draft.valueProposition,
      bioShort: draft.bioShort,
      bioLong: textToParagraphs(draft.bioLong),
      audience: textToList(draft.audience),
    });
    if (ok) setAttempted(false);
  }

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
      {SHORT_FIELDS.map((key) => (
        <BilingualField
          key={key}
          label={t(key)}
          hint={t(`${key}Hint`)}
          value={draft[key]}
          onChange={(value) => patch({ [key]: value })}
          multiline={key !== "positioningStatement"}
          rows={key === "bioShort" ? 4 : 3}
          maxLength={PROFILE_LIMITS[key]}
          errors={missingIn(draft[key], attempted, missing)}
          required
        />
      ))}
      <BilingualField
        label={t("bioLong")}
        hint={t("bioLongHint", { max: PROFILE_LIMITS.bioParagraph })}
        value={draft.bioLong}
        onChange={(bioLong) => patch({ bioLong })}
        multiline
        rows={10}
        errors={missingIn(draft.bioLong, attempted, missing)}
        required
      />
      <BilingualField
        label={t("audience")}
        hint={t("audienceHint", { max: PROFILE_LIMITS.audienceItem })}
        value={draft.audience}
        onChange={(audience) => patch({ audience })}
        multiline
        rows={4}
        errors={missingIn(draft.audience, attempted, missing)}
        required
      />
    </SectionForm>
  );
}

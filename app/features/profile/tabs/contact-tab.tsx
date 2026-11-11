import { useState } from "react";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { SectionForm } from "~/components/section-form";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { SwitchField } from "~/components/ui/switch";
import type { InstructorProfile } from "~/domain/api";
import { e164ToNational, normalizeEgyptianMobile, normalizeEgyptianPhone } from "~/domain/phone";
import { isValidSocialUrl, SOCIAL_PLATFORMS } from "~/domain/profile-rules";
import type { SocialPlatform } from "~/domain/types";
import { useDraft } from "~/lib/use-draft";
import { useProfileSave } from "../use-profile-save";

type Errors = Partial<Record<"phone" | "whatsapp" | "email" | SocialPlatform, string>>;

const isEmail = (value: string) => z.email().safeParse(value.trim()).success;

/** Contact: phone, WhatsApp ("same as phone"), public email, social links (DSH-PRO-03). */
export function ContactTab({ profile }: { profile: InstructorProfile }) {
  const t = useTranslations("profile.contact");
  const { save, saving, error, setError } = useProfileSave();
  const [errors, setErrors] = useState<Errors>({});
  const { draft, patch, dirty, reset } = useDraft({
    phone: e164ToNational(profile.contact.phoneE164),
    whatsapp: e164ToNational(profile.contact.whatsappE164),
    sameAsPhone: profile.contact.whatsappE164 === profile.contact.phoneE164,
    email: profile.contact.email,
    social: Object.fromEntries(
      SOCIAL_PLATFORMS.map((platform) => [
        platform,
        profile.social.find((link) => link.platform === platform)?.url ?? "",
      ]),
    ) as Record<SocialPlatform, string>,
  });

  async function submit() {
    const next: Errors = {};
    const phoneE164 = normalizeEgyptianPhone(draft.phone);
    const whatsappE164 = normalizeEgyptianMobile(draft.sameAsPhone ? draft.phone : draft.whatsapp);
    if (!phoneE164) next.phone = t("errors.phone");
    else if (draft.sameAsPhone && !whatsappE164) next.phone = t("errors.phoneNotMobile");
    if (!draft.sameAsPhone && !whatsappE164) next.whatsapp = t("errors.whatsapp");
    if (!isEmail(draft.email)) next.email = t("errors.email");
    for (const platform of SOCIAL_PLATFORMS) {
      const url = draft.social[platform].trim();
      if (url && !isValidSocialUrl(platform, url))
        next[platform] = t("errors.social", { platform: t(`platforms.${platform}`) });
    }
    setErrors(next);
    if (Object.keys(next).length) return setError(null);

    const ok = await save(
      {
        contact: { phoneE164: phoneE164!, whatsappE164: whatsappE164!, email: draft.email.trim() },
        social: SOCIAL_PLATFORMS.filter((p) => draft.social[p].trim()).map((platform) => ({
          platform,
          url: draft.social[platform].trim(),
        })),
      },
      (fields) =>
        setErrors({
          phone: fields["contact.phoneE164"] ? t("errors.phone") : undefined,
          whatsapp: fields["contact.whatsappE164"] ? t("errors.whatsapp") : undefined,
          email: fields["contact.email"] ? t("errors.email") : undefined,
        }),
    );
    if (ok) setErrors({});
  }

  return (
    <SectionForm
      dirty={dirty}
      saving={saving}
      onSave={submit}
      onDiscard={() => {
        reset();
        setErrors({});
        setError(null);
      }}
      error={error}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("phone")} hint={t("phoneHint")} error={errors.phone} required>
          {(control) => (
            <Input
              {...control}
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
            />
          )}
        </Field>
        <Field label={t("email")} hint={t("emailHint")} error={errors.email} required>
          {(control) => (
            <Input
              {...control}
              type="email"
              inputMode="email"
              dir="ltr"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
          )}
        </Field>
      </div>
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <SwitchField
          label={t("sameAsPhone")}
          hint={t("sameAsPhoneHint")}
          checked={draft.sameAsPhone}
          onCheckedChange={(sameAsPhone) =>
            patch({ sameAsPhone, whatsapp: sameAsPhone ? draft.phone : draft.whatsapp })
          }
        />
        {draft.sameAsPhone ? null : (
          <Field
            label={t("whatsapp")}
            hint={t("whatsappHint")}
            error={errors.whatsapp}
            required
            className="md:max-w-[calc(50%-0.625rem)]"
          >
            {(control) => (
              <Input
                {...control}
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={draft.whatsapp}
                onChange={(e) => patch({ whatsapp: e.target.value })}
              />
            )}
          </Field>
        )}
      </div>
      <div className="grid gap-5 border-t border-line pt-6">
        <div>
          <h3 className="text-subheading font-semibold">{t("social")}</h3>
          <p className="mt-0.5 text-caption text-graphite">{t("socialHint")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {SOCIAL_PLATFORMS.map((platform) => (
            <Field key={platform} label={t(`platforms.${platform}`)} error={errors[platform]}>
              {(control) => (
                <Input
                  {...control}
                  type="url"
                  inputMode="url"
                  dir="ltr"
                  placeholder={`https://${platform}.com/…`}
                  value={draft.social[platform]}
                  onChange={(e) =>
                    patch({ social: { ...draft.social, [platform]: e.target.value } })
                  }
                />
              )}
            </Field>
          ))}
        </div>
      </div>
    </SectionForm>
  );
}

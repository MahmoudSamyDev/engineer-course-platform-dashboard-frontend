import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { Ltr } from "~/components/format";
import { LanguageSwitch } from "~/components/layout/language-switch";
import { UnsavedChangesGuard } from "~/components/unsaved-changes";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toast";
import type { AdminUser } from "~/domain/admin";
import { MIN_PASSWORD_LENGTH } from "~/domain/constants";
import { useChangePasswordMutation, useUpdateMyNameMutation } from "~/features/auth/api";
import { getApiError } from "~/store/api";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-sm border border-line bg-sheet p-4 sm:p-6">
      <div>
        <h3 className="text-subheading font-semibold">{title}</h3>
        {hint ? <p className="mt-0.5 text-caption text-graphite">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Account: your name, email, language and password (DSH-PRO-08, DSH-AUTH-08). */
export function AccountTab({ user }: { user: AdminUser }) {
  const t = useTranslations("profile.account");
  const tr = useTranslations("roles");
  return (
    <div className="flex flex-col gap-6">
      <Section title={t("details")}>
        <NameForm user={user} />
        <dl className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-label font-medium text-ink">{t("email")}</dt>
            <dd className="mt-1 text-body text-graphite">
              <Ltr>{user.email}</Ltr>
            </dd>
            <dd className="text-caption text-graphite">{t("emailHint")}</dd>
          </div>
          <div>
            <dt className="text-label font-medium text-ink">{t("role")}</dt>
            <dd className="mt-1 text-body text-graphite">{tr(user.role)}</dd>
          </div>
        </dl>
      </Section>
      <Section title={t("language")} hint={t("languageHint")}>
        <LanguageSwitch signedIn className="self-start" />
      </Section>
      <Section title={t("password")} hint={t("passwordHint", { min: MIN_PASSWORD_LENGTH })}>
        <PasswordForm />
      </Section>
    </div>
  );
}

function NameForm({ user }: { user: AdminUser }) {
  const t = useTranslations("profile.account");
  const tc = useTranslations("common");
  const toast = useToast();
  const [saveName, { isLoading }] = useUpdateMyNameMutation();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string>();
  const dirty = name.trim() !== user.name;

  return (
    <form
      noValidate
      className="flex flex-col items-start gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (name.trim().length < 2) return setError(t("nameError"));
        setError(undefined);
        try {
          await saveName(name.trim()).unwrap();
          toast({ title: tc("saved") });
        } catch (e) {
          setError(getApiError(e)?.message ?? tc("saveFailed"));
        }
      }}
    >
      <Field
        label={t("name")}
        hint={t("nameHint")}
        error={error}
        required
        className="w-full sm:max-w-md"
      >
        {(control) => (
          <Input
            {...control}
            value={name}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" variant="secondary" loading={isLoading} disabled={!dirty}>
        {t("saveName")}
      </Button>
      <UnsavedChangesGuard when={dirty} />
    </form>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "current"),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, "short"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "match",
  })
  .refine((v) => !v.newPassword || v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "same",
  });
type PasswordValues = z.infer<typeof passwordSchema>;
type PasswordError = "current" | "incorrect" | "short" | "match" | "same";

function PasswordForm() {
  const t = useTranslations("profile.account");
  const tc = useTranslations("common");
  const toast = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { errors } = form.formState;
  const message = (key: string | undefined) =>
    key ? t(`passwordErrors.${key as PasswordError}`, { min: MIN_PASSWORD_LENGTH }) : undefined;

  async function submit({ currentPassword, newPassword }: PasswordValues) {
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      form.reset();
      toast({ title: t("passwordChanged") });
    } catch (e) {
      const fields = getApiError(e)?.fields ?? {};
      if (fields.currentPassword) form.setError("currentPassword", { message: "incorrect" });
      if (fields.newPassword)
        form.setError("newPassword", { message: fields.newPassword === "SAME" ? "same" : "short" });
      if (!Object.keys(fields).length)
        toast({ title: tc("saveFailed"), description: getApiError(e)?.message, tone: "error" });
    }
  }

  const passwordInput =
    (name: keyof PasswordValues, autoComplete: string) =>
    (control: Parameters<Parameters<typeof Field>[0]["children"]>[0]) => (
      <Input
        {...control}
        {...form.register(name)}
        type="password"
        autoComplete={autoComplete}
        dir="ltr"
      />
    );

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-4 sm:max-w-md">
      <Field label={t("currentPassword")} error={message(errors.currentPassword?.message)} required>
        {passwordInput("currentPassword", "current-password")}
      </Field>
      <Field label={t("newPassword")} error={message(errors.newPassword?.message)} required>
        {passwordInput("newPassword", "new-password")}
      </Field>
      <Field label={t("confirmPassword")} error={message(errors.confirmPassword?.message)} required>
        {passwordInput("confirmPassword", "new-password")}
      </Field>
      <Button type="submit" variant="secondary" loading={isLoading} className="justify-self-start">
        {t("changePassword")}
      </Button>
    </form>
  );
}

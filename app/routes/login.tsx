import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { BrandBlock } from "~/components/layout/brand-block";
import { LanguageSwitch } from "~/components/layout/language-switch";
import { MOCKING_ENABLED } from "~/components/layout/mock-banner";
import { StatusScreen } from "~/components/layout/status-screen";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input, inputClasses } from "~/components/ui/input";
import { authApi, useLoginMutation, useUpdateMyLocaleMutation } from "~/features/auth/api";
import { safeNextPath } from "~/features/auth/redirect";
import { readStoredLocale } from "~/i18n/config";
import { checkLogin, type LoginInput, type LoginProblems } from "~/features/auth/schema";
import { cn } from "~/lib/cn";
import { api, getApiError, isNetworkError } from "~/store/api";
import { useAppSelector } from "~/store/hooks";
import { selectLocale } from "~/store/ui-slice";
import { store } from "~/store/store";
import type { Route } from "./+types/login";

/** Already signed in? Go straight to where you were heading. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("reason") === "signed-out") return null;
  const result = await store.dispatch(
    authApi.endpoints.me.initiate(undefined, { subscribe: false, forceRefetch: true }),
  );
  // `isSuccess`, not `data`: a failed refetch keeps the last user in `data`, which would
  // bounce an expired session straight back to the page it came from (DSH-AUTH-05).
  if (result.isSuccess) throw redirect(safeNextPath(url.searchParams.get("next")));
  return null;
}

/** SRS DSH-AUTH-01…03, DSH-AUTH-07. */
export default function Login() {
  const t = useTranslations();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [saveLocale] = useUpdateMyLocaleMutation();
  const uiLocale = useAppSelector(selectLocale);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Nothing from a previous session (expired, signed out elsewhere) stays in memory for the
  // next person to sign in. Safe here: the signed-in pages are unmounted, nothing is loading.
  useEffect(() => {
    store.dispatch(api.util.resetApiState());
  }, []);

  const reason = params.get("reason");
  const notice =
    reason === "expired"
      ? t("auth.sessionEnded")
      : reason === "signed-out"
        ? t("auth.signedOut")
        : null;

  // Errors show after a field is left or the form is sent, then update as you type (DSH-AUTH-01).
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof LoginInput, boolean>>>({});
  const problems: LoginProblems = checkLogin(values);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const field = (name: keyof LoginInput) => ({
    name,
    value: values[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  // Problem codes → messages that say what to change (DESIGN_SYSTEM §9).
  const emailError = !touched.email
    ? undefined
    : problems.email === "required"
      ? t("auth.errors.emailRequired")
      : problems.email
        ? t("auth.errors.emailInvalid")
        : undefined;
  const passwordError =
    touched.password && problems.password ? t("auth.errors.passwordRequired") : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isLoading) return;
    setTouched({ email: true, password: true });
    if (problems.email) return emailInput.current?.focus();
    if (problems.password) return passwordInput.current?.focus();
    void onSubmit({ email: values.email.trim(), password: values.password });
  }

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      let user = await login(values).unwrap();
      // A language chosen in this browser is the latest explicit choice: keep it (DSH-GEN-02).
      // With no stored choice the page only shows the default, and the account's saved
      // language wins (DAC-09: "remembered on next sign-in").
      if (readStoredLocale() !== null && user.locale !== uiLocale)
        user = await saveLocale(uiLocale)
          .unwrap()
          .catch(() => user);
      // Seed `me` with the final user and wait for it, so the app layout's guard finds them at
      // once (not a pending entry) and in the language just chosen (DAC-09).
      await store.dispatch(authApi.util.upsertQueryData("me", undefined, user));
      navigate(safeNextPath(params.get("next")), { replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError?.code === "SIGN_IN_LOCKED") setFormError(t("auth.errors.locked"));
      else if (apiError?.code === "INVALID_CREDENTIALS")
        setFormError(t("auth.errors.invalidCredentials"));
      else if (isNetworkError(error)) setFormError(t("auth.errors.network"));
      else setFormError(t("errors.genericDescription"));
    }
  }

  return (
    <StatusScreen>
      <title>{t("app.documentTitle", { page: t("auth.title") })}</title>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BrandBlock />
        </div>
        <LanguageSwitch />
      </div>

      <main className="rounded-sm border border-line bg-sheet p-6 sm:p-8">
        <h1 className="font-display text-title font-semibold">{t("auth.title")}</h1>
        <p className="mt-1 text-body text-graphite">{t("auth.description")}</p>

        {notice ? (
          <p role="status" className="mt-5 rounded-sm bg-info-wash px-3 py-2 text-body text-info">
            {notice}
          </p>
        ) : null}

        <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Field label={t("auth.email")} error={emailError} required>
            {(control) => (
              <Input
                {...control}
                {...field("email")}
                ref={emailInput}
                type="email"
                inputMode="email"
                autoComplete="username"
                dir="ltr"
              />
            )}
          </Field>

          <Field label={t("auth.password")} error={passwordError} required>
            {(control) => (
              <div className="relative">
                <input
                  {...control}
                  {...field("password")}
                  ref={passwordInput}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  // The field is always left-to-right (dir="ltr"), so logical padding would follow the
                  // text, not the page. The eye sits on the page's end side (left in Arabic):
                  // reserve room on that physical side so typing never runs under it.
                  className={cn(inputClasses, "[[dir=ltr]_&]:pr-11 [[dir=rtl]_&]:pl-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 end-0 inline-flex w-11 items-center justify-center text-graphite hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
            )}
          </Field>

          {formError ? (
            <p
              role="alert"
              className="rounded-sm bg-danger-wash px-3 py-2 text-body font-medium text-danger"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
            {t("auth.submit")}
          </Button>
        </form>

        <p className="mt-5 text-caption text-graphite">{t("auth.forgot")}</p>
      </main>

      {/* `import.meta.env.DEV` inline so production builds drop the mock credentials entirely. */}
      {import.meta.env.DEV && MOCKING_ENABLED ? (
        <p className="mt-4 text-center text-caption text-graphite" dir="auto">
          {t("auth.mockAccounts", {
            accounts: "owner@example.com, admin@example.com",
            password: "dashboard-demo",
          })}
        </p>
      ) : null}
    </StatusScreen>
  );
}

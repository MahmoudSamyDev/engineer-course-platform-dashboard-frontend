import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { BrandBlock } from "~/components/layout/brand-block";
import { LanguageSwitch } from "~/components/layout/language-switch";
import { MOCKING_ENABLED } from "~/components/layout/mock-banner";
import { StatusScreen } from "~/components/layout/status-screen";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input, inputClasses } from "~/components/ui/input";
import { authApi, useLoginMutation } from "~/features/auth/api";
import { safeNextPath } from "~/features/auth/redirect";
import { loginSchema, type LoginInput } from "~/features/auth/schema";
import { cn } from "~/lib/cn";
import { getApiError, isNetworkError } from "~/store/api";
import { store } from "~/store/store";
import type { Route } from "./+types/login";

/** Already signed in? Go straight to where you were heading. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("reason") === "signed-out") return null;
  const result = await store.dispatch(
    authApi.endpoints.me.initiate(undefined, { subscribe: false, forceRefetch: true }),
  );
  if (result.data) throw redirect(safeNextPath(url.searchParams.get("next")));
  return null;
}

/** SRS DSH-AUTH-01…03, DSH-AUTH-07. */
export default function Login() {
  const t = useTranslations();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reason = params.get("reason");
  const notice =
    reason === "expired"
      ? t("auth.sessionEnded")
      : reason === "signed-out"
        ? t("auth.signedOut")
        : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  // Schema codes → messages that say what to change (DESIGN_SYSTEM §9).
  const emailError =
    errors.email?.message === "required"
      ? t("auth.errors.emailRequired")
      : errors.email
        ? t("auth.errors.emailInvalid")
        : undefined;
  const passwordError = errors.password ? t("auth.errors.passwordRequired") : undefined;

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      await login(values).unwrap();
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

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
          <Field label={t("auth.email")} error={emailError} required>
            {(control) => (
              <Input
                {...control}
                {...register("email")}
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
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  className={cn(inputClasses, "pe-11")}
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

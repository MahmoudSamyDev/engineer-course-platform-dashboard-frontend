import { useTranslations } from "use-intl";

export const MOCKING_ENABLED = import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === "true";

/** Visible reminder that the data is not real (SRS DSH-GEN-10). Development only. */
export function MockBanner() {
  const t = useTranslations("app");
  if (!MOCKING_ENABLED) return null;
  return (
    <p className="border-b border-warning/25 bg-warning-wash px-4 py-1 text-center text-caption font-medium text-warning">
      {t("mockBanner")}
    </p>
  );
}

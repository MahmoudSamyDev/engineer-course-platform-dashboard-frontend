import type { Locale } from "~/domain/types";
import type { Messages } from "./config";

// Type-safe message keys and locales for use-intl (useTranslations).
declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}

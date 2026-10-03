import { useEffect } from "react";
import { readStoredLocale } from "~/i18n/config";
import { useAppDispatch } from "~/store/hooks";
import { localeChanged } from "~/store/ui-slice";

/**
 * After hydration, apply the language this browser chose last time (DSH-GEN-02).
 * Runs in an effect so the pre-rendered index.html (Arabic) and the first client render match.
 * Once signed in, the user's saved preference takes over (app-layout).
 */
export function LocaleBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) dispatch(localeChanged(stored));
  }, [dispatch]);
  return null;
}

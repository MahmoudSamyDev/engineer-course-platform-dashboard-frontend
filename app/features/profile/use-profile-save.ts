import { useState } from "react";
import { useTranslations } from "use-intl";
import { useToast } from "~/components/ui/toast";
import type { UpdateInstructorInput } from "~/domain/api";
import type { LocalizedText } from "~/domain/types";
import { getApiError } from "~/store/api";
import { useUpdateInstructorMutation } from "./api";

/**
 * Saves one profile section (DSH-PRO-01: tabs save independently). Server field errors
 * are handed back so the tab can point at the field; anything else becomes a form error.
 */
export function useProfileSave() {
  const tc = useTranslations("common");
  const toast = useToast();
  const [update, { isLoading }] = useUpdateInstructorMutation();
  const [error, setError] = useState<string | null>(null);

  async function save(
    body: UpdateInstructorInput,
    onFieldErrors?: (fields: Record<string, string>) => void,
  ): Promise<boolean> {
    setError(null);
    try {
      await update(body).unwrap();
      toast({ title: tc("saved") });
      return true;
    } catch (e) {
      const apiError = getApiError(e);
      if (apiError?.fields && onFieldErrors) onFieldErrors(apiError.fields);
      setError(apiError?.message ?? tc("saveFailed"));
      return false;
    }
  }

  return { save, saving: isLoading, error, setError };
}

/** Per-language "fill this in" errors for a BilingualField, shown after a save attempt. */
export function missingIn(
  text: LocalizedText,
  show: boolean,
  message: string,
): Partial<LocalizedText> | undefined {
  if (!show) return undefined;
  const errors = {
    ar: text.ar.trim() ? undefined : message,
    en: text.en.trim() ? undefined : message,
  };
  return errors.ar || errors.en ? errors : undefined;
}

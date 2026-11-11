import { useState } from "react";
import { useTranslations } from "use-intl";
import { checkImage, maxMegabytes, UPLOAD_RULES, type UploadKind } from "~/domain/uploads";
import { getApiError } from "~/store/api";
import { useUploadImageMutation } from "./api";

/** Reads an image's pixel size in the browser (only called from an event handler). */
async function imageSize(file: File): Promise<{ width: number; height: number } | undefined> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return undefined; // Unreadable here (e.g. jsdom): the API checks again.
  }
}

/**
 * Validates a picked image against its upload rule, uploads it and returns the URL.
 * Errors are worded for the person choosing the file (type, size, minimum dimensions).
 */
export function useImageUpload(kind: UploadKind) {
  const t = useTranslations("uploads");
  const [upload, { isLoading }] = useUploadImageMutation();
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<string | null> {
    setError(null);
    const rule = UPLOAD_RULES[kind];
    const needsSize = Boolean(rule.minWidth || rule.minHeight);
    const problem = checkImage(kind, file, needsSize ? await imageSize(file) : undefined);
    if (problem) {
      setError(
        t(problem, {
          max: maxMegabytes(kind),
          width: rule.minWidth ?? 0,
          height: rule.minHeight ?? 0,
        }),
      );
      return null;
    }
    try {
      const image = await upload({ file, kind }).unwrap();
      return image.url;
    } catch (e) {
      setError(getApiError(e)?.message ?? t("failed"));
      return null;
    }
  }

  return { uploadFile, uploading: isLoading, error, clearError: () => setError(null) };
}

/**
 * Image upload rules (SRS §7.2 `POST /admin/uploads`, DSH-ASS-02, DSH-PRO-02/06).
 * Checked in the browser for quick feedback; the API checks again (DNFR-SEC).
 */

export type UploadKind = "instructor-photo" | "assistant-photo" | "certification";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const MB = 1024 * 1024;

export type UploadRule = {
  maxBytes: number;
  /** Smallest acceptable size in pixels, when the Website layout needs it. */
  minWidth?: number;
  minHeight?: number;
};

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  // DSH-PRO-02: ≤ 5 MB, at least 800×1000 for the 4:5 hero crop.
  "instructor-photo": { maxBytes: 5 * MB, minWidth: 800, minHeight: 1000 },
  // DSH-ASS-02: ≤ 2 MB, shown as a small square avatar.
  "assistant-photo": { maxBytes: 2 * MB },
  // DSH-PRO-06: optional certificate image.
  certification: { maxBytes: 5 * MB },
};

export type ImageProblem = "type" | "size" | "dimensions" | null;

/** What's wrong with a picked image, if anything. `width`/`height` are known after decoding. */
export function checkImage(
  kind: UploadKind,
  file: { type: string; size: number },
  dimensions?: { width: number; height: number },
): ImageProblem {
  const rule = UPLOAD_RULES[kind];
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > rule.maxBytes) return "size";
  if (
    dimensions &&
    ((rule.minWidth && dimensions.width < rule.minWidth) ||
      (rule.minHeight && dimensions.height < rule.minHeight))
  )
    return "dimensions";
  return null;
}

/** Whole megabytes for messages ("up to 2 MB"). */
export function maxMegabytes(kind: UploadKind): number {
  return Math.round(UPLOAD_RULES[kind].maxBytes / MB);
}

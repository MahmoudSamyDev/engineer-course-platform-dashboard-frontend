import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";
import { Button } from "./button";
import { Spinner } from "./spinner";

const SHAPES = {
  /** Avatars (assistant photo). */
  square: "aspect-square w-24 rounded-full",
  /** 4:5 portrait — the Website hero crop (DSH-PRO-02). */
  portrait: "aspect-[4/5] w-40 rounded-sm",
  /** Certificates and documents. */
  landscape: "aspect-[4/3] w-36 rounded-sm",
};

/**
 * Image preview + choose / replace / remove. The preview uses the same crop the image gets
 * where it's shown (object-cover), so what you see is what students see. Validation and
 * upload happen in the caller (`onSelect`); this only shows state.
 */
export function ImagePicker({
  label,
  src,
  previewAlt = "",
  shape,
  accept = "image/jpeg,image/png,image/webp",
  hint,
  error,
  uploading = false,
  onSelect,
  onRemove,
}: {
  label: string;
  src: string | null | undefined;
  previewAlt?: string;
  shape: keyof typeof SHAPES;
  accept?: string;
  hint?: ReactNode;
  error?: string | null;
  uploading?: boolean;
  onSelect: (file: File) => void;
  onRemove?: () => void;
}) {
  const t = useTranslations("common");
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-label font-medium text-ink">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-paper text-concrete",
            SHAPES[shape],
          )}
        >
          {src ? (
            <img src={src} alt={previewAlt} className="size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" strokeWidth={1.5} className="size-8" />
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-sheet/70">
              <Spinner />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input
            ref={input}
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = ""; // Picking the same file again still fires onChange.
              if (file) onSelect(file);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={uploading}
            aria-describedby={
              [hint ? hintId : "", error ? errorId : ""].join(" ").trim() || undefined
            }
            onClick={() => input.current?.click()}
          >
            <Upload aria-hidden="true" />
            {uploading ? t("uploading") : src ? t("replaceImage") : t("chooseImage")}
          </Button>
          {src && onRemove ? (
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={uploading}>
              <Trash2 aria-hidden="true" />
              {t("removeImage")}
            </Button>
          ) : null}
        </div>
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-caption text-graphite">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

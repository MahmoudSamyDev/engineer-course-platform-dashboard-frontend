import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import type { Locale, LocalizedText } from "~/domain/types";
import { cn } from "~/lib/cn";
import { Field } from "./field";
import { inputClasses } from "./input";

/**
 * Arabic and English versions side by side (≥ 768px), stacked below (DSH-GEN-03).
 * Each control has its own `lang` and `dir`; an optional limit shows a live counter.
 */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  maxLength,
  errors,
  hint,
  required,
}: {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  errors?: Partial<Record<Locale, string>>;
  hint?: ReactNode;
  required?: boolean;
}) {
  const t = useTranslations("common");
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-label font-medium text-ink">
        {label}
        {required ? <span className="text-graphite"> · {t("required")}</span> : null}
      </legend>
      {hint ? <p className="-mt-1 text-caption text-graphite">{hint}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {(["ar", "en"] as const).map((locale) => {
          const text = value[locale] ?? "";
          const common = {
            lang: locale,
            dir: locale === "ar" ? "rtl" : "ltr",
            value: text,
            maxLength,
            onChange: (event: { target: { value: string } }) =>
              onChange({ ...value, [locale]: event.target.value }),
          } as const;
          return (
            <Field
              key={locale}
              label={
                <span className="text-caption text-graphite">
                  {t(locale === "ar" ? "arabic" : "english")}
                </span>
              }
              error={errors?.[locale]}
              hint={maxLength ? t("charactersLeft", { count: maxLength - text.length }) : undefined}
            >
              {(control) =>
                multiline ? (
                  <textarea
                    {...control}
                    {...common}
                    rows={rows}
                    className={cn(inputClasses, "h-auto py-2 leading-6 touch:h-auto")}
                  />
                ) : (
                  <input {...control} {...common} className={inputClasses} />
                )
              }
            </Field>
          );
        })}
      </div>
    </fieldset>
  );
}

import type { Locale, LocalizedText } from "~/domain/types";
import { cn } from "~/lib/cn";

/**
 * Generated "sheet cover" — the same device the Website uses (DESIGN_SYSTEM §1, Website D-022):
 * a drafting grid, an inset sheet border, the course code and its discipline.
 */
export function CourseCover({
  code,
  discipline,
  sortOrder,
  locale,
  className,
}: {
  code: string;
  discipline: LocalizedText;
  sortOrder: number;
  locale: Locale;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate aspect-[16/9] overflow-hidden bg-sheet",
        "bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)]",
        "bg-[size:20px_20px]",
        className,
      )}
    >
      <div className="absolute inset-2.5 border-[1.5px] border-ink/70" />
      <div className="absolute inset-2.5 flex flex-col justify-between p-3">
        <span
          dir="ltr"
          className="self-start font-display text-[2.5rem] leading-none font-bold text-cyan-deep"
        >
          {code}
        </span>
        <span className="flex items-end justify-between gap-3 border-t-[1.5px] border-ink/70 pt-1.5 text-caption font-medium text-ink">
          <span className="truncate">{discipline[locale]}</span>
          <span dir="ltr" className="tabular text-graphite">
            S-{String(sortOrder).padStart(2, "0")}
          </span>
        </span>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

/**
 * The signature component (DESIGN_SYSTEM §1): facts in labelled cells inside one ruled frame.
 * Cells wrap to 2 columns on phones.
 */
export function TitleBlock({
  children,
  className,
  columns = 4,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[
    columns
  ];
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-sm border-[1.5px] border-line-strong bg-line",
        cols,
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function TitleCell({
  label,
  value,
  note,
  size = "kpi",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  size?: "kpi" | "fact";
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 bg-sheet p-4", className)}>
      <dt className="text-label font-medium text-graphite">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-ink tabular",
          size === "kpi"
            ? "font-display text-[1.375rem] leading-7 font-semibold sm:text-kpi"
            : "text-subheading font-semibold",
        )}
      >
        {value}
      </dd>
      {note ? <dd className="min-w-0 text-caption text-wrap text-graphite">{note}</dd> : null}
    </div>
  );
}

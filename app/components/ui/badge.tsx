import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info";

const TONES: Record<BadgeTone, string> = {
  success: "bg-success-wash text-success",
  warning: "bg-warning-wash text-warning",
  danger: "bg-danger-wash text-danger",
  neutral: "bg-neutral-wash text-neutral",
  info: "bg-info-wash text-info",
};

/** Status label with a square marker — never color alone (DESIGN_SYSTEM §3). */
export function Badge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 text-caption font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-current" />
      {children}
    </span>
  );
}

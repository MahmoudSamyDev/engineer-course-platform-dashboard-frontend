import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";

/** 40px (44px + 16px text on touch), 1.5px line-strong border, cyan focus (DESIGN_SYSTEM §5–6). */
export const inputClasses = cn(
  "h-10 w-full rounded-sm border-[1.5px] border-line-strong bg-sheet px-3 text-body text-ink",
  "touch:h-11 touch:text-body-touch",
  "placeholder:text-graphite/70",
  "transition-colors duration-150 hover:border-graphite",
  "focus-visible:border-cyan focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-cyan",
  "aria-invalid:border-danger",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-graphite",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

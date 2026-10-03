import { Tooltip } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~/lib/cn";

/** Icon-only button: always an accessible name and a tooltip (DESIGN_SYSTEM §6). */
export function IconButton({ label, children, className, ...props }: ComponentProps<"button"> & { label: string; children: ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-graphite hover:bg-paper hover:text-ink disabled:opacity-50 touch:size-11 [&_svg]:size-4",
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content sideOffset={4} className="z-50 rounded-sm bg-ink px-2 py-1 text-caption text-sheet">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

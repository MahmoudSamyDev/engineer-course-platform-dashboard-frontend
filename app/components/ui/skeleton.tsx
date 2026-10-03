import { cn } from "~/lib/cn";

/** Placeholder block at the real content size (no layout shift). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-pulse rounded-xs bg-line/70 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

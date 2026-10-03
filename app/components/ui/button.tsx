import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Safety yellow is reserved for the one primary action of a region (DESIGN_SYSTEM §3).
  primary: "bg-safety text-ink hover:bg-safety-hover active:bg-safety-hover",
  secondary: "border border-line-strong bg-sheet text-ink hover:bg-paper",
  ghost: "text-cyan hover:bg-cyan-wash",
  danger: "border border-danger/40 bg-sheet text-danger hover:bg-danger-wash",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-body touch:h-11",
  md: "h-10 px-4 text-body touch:h-11",
  lg: "h-11 px-5 text-subheading",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner, keeps the label, and blocks repeat clicks (SRS DSH-GEN-05). */
  loading?: boolean;
  /** Render the child element (e.g. a router Link) with button styles. */
  asChild?: boolean;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  asChild = false,
  className,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap",
    "transition-colors duration-150 select-none",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

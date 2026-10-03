import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";
import { Input } from "./input";

/**
 * A number with a unit suffix (EGP). The wrapper is forced to LTR so the suffix and the
 * input's padding end up on the same side in Arabic too — numbers read left-to-right in
 * both languages (DSH-GEN-09).
 */
export function AmountInput({
  suffix,
  className,
  ...props
}: ComponentProps<"input"> & { suffix: string }) {
  return (
    <div dir="ltr" className="relative">
      <Input
        {...props}
        type="number"
        inputMode="decimal"
        dir="ltr"
        className={cn("pe-16", className)}
      />
      <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-caption text-graphite">
        {suffix}
      </span>
    </div>
  );
}

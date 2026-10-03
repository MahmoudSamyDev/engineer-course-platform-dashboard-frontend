import type { ComponentProps } from "react";
import { cn } from "~/lib/cn";
import { inputClasses } from "./input";

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(inputClasses, "h-auto py-2 leading-6 touch:h-auto", className)}
      {...props}
    />
  );
}

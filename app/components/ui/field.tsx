import { Label } from "radix-ui";
import { useId, type ReactElement, type ReactNode } from "react";
import { cn } from "~/lib/cn";

type ControlProps = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

/**
 * Label + control + hint + error (DESIGN_SYSTEM §6). The error is linked with
 * aria-describedby and announced; the control gets aria-invalid.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (control: ControlProps) => ReactElement;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label.Root htmlFor={id} className="text-label font-medium text-ink">
        {label}
      </Label.Root>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-caption text-graphite">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

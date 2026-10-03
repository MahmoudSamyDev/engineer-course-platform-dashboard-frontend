import { Switch as RadixSwitch } from "radix-ui";
import { useId, type ReactNode } from "react";

/** On/off setting with a visible label and optional hint; the state is also spoken (role=switch). */
export function SwitchField({
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-body font-medium text-ink">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="mt-0.5 text-caption text-graphite">
            {hint}
          </p>
        ) : null}
      </div>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="relative h-6 w-11 shrink-0 rounded-full border-[1.5px] border-line-strong bg-paper transition-colors duration-150 disabled:opacity-50 data-[state=checked]:border-cyan data-[state=checked]:bg-cyan"
      >
        <RadixSwitch.Thumb className="block size-[1.125rem] translate-x-0.5 rounded-full bg-sheet shadow-sm ring-1 ring-line-strong transition-transform duration-150 data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:ring-cyan rtl:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-[1.375rem]" />
      </RadixSwitch.Root>
    </div>
  );
}

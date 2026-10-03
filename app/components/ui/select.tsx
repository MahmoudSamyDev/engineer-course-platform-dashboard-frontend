import { Check, ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import { cn } from "~/lib/cn";

export type SelectOption = { value: string; label: string };

const ALL = "__all__";

/**
 * Radix Select styled as an input. `allLabel` adds a first "all" option that maps to
 * `undefined` (used by filters).
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  allLabel,
  id,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
}: {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  allLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
}) {
  return (
    <RadixSelect.Root
      value={value ?? (allLabel ? ALL : undefined)}
      onValueChange={(next) => onValueChange(next === ALL ? undefined : next)}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-sm border-[1.5px] border-line-strong bg-sheet px-3 text-start text-body text-ink touch:h-11 touch:text-body-touch",
          "hover:border-graphite focus-visible:border-cyan focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-cyan",
          "aria-invalid:border-danger disabled:bg-paper disabled:text-graphite data-[placeholder]:text-graphite",
          className,
        )}
      >
        <span className="truncate">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-graphite" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-sheet shadow-float"
        >
          <RadixSelect.Viewport className="p-1">
            {(allLabel ? [{ value: ALL, label: allLabel }, ...options] : options).map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative flex h-10 cursor-default items-center rounded-sm ps-8 pe-3 text-body text-ink outline-none select-none data-[highlighted]:bg-paper data-[state=checked]:font-semibold"
              >
                <RadixSelect.ItemIndicator className="absolute start-2.5">
                  <Check aria-hidden="true" className="size-4 text-cyan" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

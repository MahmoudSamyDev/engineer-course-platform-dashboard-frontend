import { EllipsisVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

/** "More actions" menu for rows and cards. */
export function ActionMenu({
  label,
  children,
  align = "end",
}: {
  label: string;
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-graphite hover:bg-paper hover:text-ink data-[state=open]:bg-paper touch:size-11"
      >
        <EllipsisVertical aria-hidden="true" className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={4}
          className="z-50 min-w-48 animate-dialog-in rounded-md border border-line bg-sheet p-1 shadow-float"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function ActionMenuItem({
  children,
  onSelect,
  destructive = false,
  disabled = false,
}: {
  children: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "flex h-10 cursor-default items-center gap-2.5 rounded-sm px-2.5 text-body outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-paper [&_svg]:size-4",
        destructive ? "text-danger" : "text-ink [&_svg]:text-graphite",
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function ActionMenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />;
}

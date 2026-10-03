import { Tabs as RadixTabs } from "radix-ui";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { cn } from "~/lib/cn";

/** Underline tabs bound to `?tab=` so a tab can be linked and survives refresh (DSH-CRS-04, DSH-PRO-01). */
export function UrlTabs<T extends string>({
  tabs,
  defaultTab,
  label,
  children,
}: {
  tabs: ReadonlyArray<{ value: T; label: ReactNode; marker?: ReactNode }>;
  defaultTab: T;
  label: string;
  children: (active: T) => ReactNode;
}) {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") as T | null;
  const active = tabs.some((t) => t.value === requested) ? requested! : defaultTab;

  return (
    <RadixTabs.Root
      value={active}
      onValueChange={(value) =>
        setParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (value === defaultTab) next.delete("tab");
            else next.set("tab", value);
            return next;
          },
          { replace: true, preventScrollReset: true },
        )
      }
    >
      <RadixTabs.List
        aria-label={label}
        className="mb-6 flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line"
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-2 px-3 text-body whitespace-nowrap text-graphite transition-colors duration-150 hover:text-ink",
              "data-[state=active]:font-semibold data-[state=active]:text-ink",
              "data-[state=active]:after:absolute data-[state=active]:after:inset-x-2 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-cyan",
            )}
          >
            {tab.label}
            {tab.marker}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      <RadixTabs.Content value={active} className="outline-none">
        {children(active)}
      </RadixTabs.Content>
    </RadixTabs.Root>
  );
}

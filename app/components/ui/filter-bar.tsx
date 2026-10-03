import { ListFilter, Search, X } from "lucide-react";
import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { inputClasses } from "./input";

/**
 * Search box with a 300 ms debounce (DSH-STU-02). The term stays in component state, never
 * in the URL, because it often contains phone numbers or emails (DSH-GEN-04).
 */
export function SearchInput({
  label,
  placeholder,
  value,
  onSearch,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onSearch: (value: string) => void;
  className?: string;
}) {
  const t = useTranslations("common");
  const [text, setText] = useState(value);
  const search = useEffectEvent((term: string) => onSearch(term));

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => search(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text, value]);

  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className={cn(inputClasses, "ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {text ? (
        <button
          type="button"
          aria-label={t("clearSearch")}
          onClick={() => {
            setText("");
            onSearch("");
          }}
          className="absolute end-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-graphite hover:bg-paper"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Filter row: search first, then filters, then actions. Below 768px the filters move into a
 * dialog behind a "Filters (n)" button so the list stays on screen (design.md §4).
 */
export function FilterBar({
  search,
  children,
  actions,
  activeCount = 0,
}: {
  search: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  activeCount?: number;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex gap-2 md:hidden">
        <div className="min-w-0 flex-1">{search}</div>
        {children ? (
          <Button variant="secondary" onClick={() => setOpen(true)} className="touch:h-11">
            <ListFilter aria-hidden="true" />
            {activeCount ? t("filtersCount", { count: activeCount }) : t("filters")}
          </Button>
        ) : null}
      </div>
      {children ? (
        <Dialog open={open} onOpenChange={setOpen} title={t("filters")} size="sm" footer={<Button variant="primary" onClick={() => setOpen(false)}>{t("showResults")}</Button>}>
          <div className="flex flex-col gap-3 md:hidden">{children}</div>
        </Dialog>
      ) : null}
      <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex [&>*]:w-auto">
        <div className="min-w-64 flex-1">{search}</div>
        {children}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}

/** Active filters as removable chips + Clear all (DSH-STU-03). */
export function FilterChips({ chips, onClearAll }: { chips: Array<{ key: string; label: string; onRemove: () => void }>; onClearAll: () => void }) {
  const t = useTranslations("common");
  if (chips.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex h-8 items-center gap-1 rounded-sm border border-line-strong bg-sheet ps-2.5 pe-1 text-caption text-ink">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={t("removeFilter", { filter: chip.label })}
            className="inline-flex size-6 items-center justify-center rounded-xs text-graphite hover:bg-paper hover:text-ink"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onClearAll} className="h-8 px-2 text-caption font-medium text-cyan hover:underline">
        {t("clearAll")}
      </button>
    </div>
  );
}

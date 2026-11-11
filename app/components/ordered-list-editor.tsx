import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { Button } from "./ui/button";
import { IconButton } from "./ui/icon-button";

/**
 * Ordered, reorderable items (modules, FAQ, certifications, journey). Move up/down buttons
 * instead of drag-and-drop so it works with a keyboard and on phones (WCAG 2.5.7).
 */
export function OrderedListEditor<T>({
  items,
  onChange,
  itemLabel,
  renderItem,
  createItem,
  addLabel,
  emptyText,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  itemLabel: (index: number) => string;
  renderItem: (item: T, update: (item: T) => void, index: number) => ReactNode;
  createItem: () => T;
  addLabel: string;
  emptyText: string;
}) {
  const t = useTranslations("common");
  const move = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line-strong p-4 text-body text-graphite">
          {emptyText}
        </p>
      ) : null}
      <ol className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="rounded-sm border border-line">
            <div className="flex items-center gap-1 border-b border-line bg-paper px-3 py-1.5">
              <span className="flex-1 text-label font-semibold text-ink tabular">
                {itemLabel(index)}
              </span>
              <IconButton
                label={t("moveUp", { item: itemLabel(index) })}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp aria-hidden="true" />
              </IconButton>
              <IconButton
                label={t("moveDown", { item: itemLabel(index) })}
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown aria-hidden="true" />
              </IconButton>
              <IconButton
                label={t("remove", { item: itemLabel(index) })}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="hover:text-danger"
              >
                <Trash2 aria-hidden="true" />
              </IconButton>
            </div>
            <div className="flex flex-col gap-4 p-3 sm:p-4">
              {renderItem(
                item,
                (updated) => onChange(items.map((current, i) => (i === index ? updated : current))),
                index,
              )}
            </div>
          </li>
        ))}
      </ol>
      <Button
        variant="secondary"
        onClick={() => onChange([...items, createItem()])}
        className="self-start"
      >
        <Plus aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  );
}

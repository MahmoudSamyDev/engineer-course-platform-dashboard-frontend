import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { Button } from "./button";
import { Select } from "./select";

export const PAGE_SIZES = [10, 25, 50] as const;

/** "Showing 26–50 of 312", page size, previous/next (DSH-STU-04). Directional icons mirror in RTL. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const t = useTranslations("common");
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav aria-label={t("pagination")} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="tabular text-caption text-graphite" aria-live="polite">
        {t("showing", { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <Select
          aria-label={t("rowsPerPage")}
          value={String(pageSize)}
          onValueChange={(value) => value && onPageSizeChange(Number(value))}
          options={PAGE_SIZES.map((size) => ({ value: String(size), label: t("perPage", { size }) }))}
          className="h-9 w-auto touch:h-11"
        />
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft aria-hidden="true" className="rtl:-scale-x-100" />
          {t("previous")}
        </Button>
        <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          {t("next")}
          <ChevronRight aria-hidden="true" className="rtl:-scale-x-100" />
        </Button>
      </div>
    </nav>
  );
}

import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";

/** Sold vs capacity: a cyan bar on a line track, always with the number beside it (DESIGN_SYSTEM §3). */
export function SeatBar({ sold, capacity, className }: { sold: number; capacity: number; className?: string }) {
  const t = useTranslations("common");
  const ratio = capacity > 0 ? Math.min(1, sold / capacity) : 0;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span aria-hidden="true" className="relative h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-line">
        <span className="absolute inset-y-0 start-0 rounded-full bg-cyan" style={{ width: `${ratio * 100}%` }} />
      </span>
      <span className="tabular shrink-0 text-caption whitespace-nowrap text-graphite">
        {t("seatsOf", { sold, capacity })}
      </span>
    </div>
  );
}

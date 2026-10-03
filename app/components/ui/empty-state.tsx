import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

/** Says what will appear here and offers one next step (DESIGN_SYSTEM §6, §9). */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-sm border border-dashed border-line-strong bg-sheet px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-concrete [&_svg]:size-8">{icon}</div> : null}
      <h2 className="font-display text-heading font-semibold">{title}</h2>
      {description ? <p className="max-w-prose text-body text-graphite">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

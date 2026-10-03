import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/cn";

/** A titled surface for one block of a page (Home panels, detail sections). */
export function Panel({
  title,
  action,
  children,
  className,
  id,
}: {
  title: ReactNode;
  action?: { to: string; label: string };
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex min-w-0 flex-col rounded-sm border border-line bg-sheet", className)}
    >
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4 py-2">
        <h2 id={headingId} className="font-display text-subheading font-semibold">
          {title}
        </h2>
        {action ? (
          <Link
            to={action.to}
            className="text-caption font-medium whitespace-nowrap text-cyan hover:underline"
          >
            {action.label}
          </Link>
        ) : null}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

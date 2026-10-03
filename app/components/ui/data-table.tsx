import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "~/lib/cn";
import { ErrorState } from "./error-state";
import { Skeleton } from "./skeleton";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** API sort field; makes the header a sort button. */
  sortKey?: string;
  align?: "start" | "end";
  className?: string;
};

/**
 * Schedule-style table (DESIGN_SYSTEM §7.3): semantic <table>, ruled rows, sortable headers with
 * aria-sort, skeleton rows, empty and error states. Below 768px rows become stacked items
 * (`mobileRow`), so phones never scroll sideways (DSH-STU-07).
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  rowHref,
  rowState,
  onRowClick,
  mobileRow,
  loading,
  error,
  onRetry,
  empty,
  sort,
  onSortChange,
  skeletonRows = 8,
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  rowHref?: (row: T) => string;
  /** Router state passed with row navigation (e.g. the list URL for a "back" link). */
  rowState?: unknown;
  onRowClick?: (row: T) => void;
  mobileRow: (row: T) => ReactNode;
  loading: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty: ReactNode;
  sort?: string;
  onSortChange?: (sort: string) => void;
  skeletonRows?: number;
}) {
  const navigate = useNavigate();
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!loading && rows && rows.length === 0) return <>{empty}</>;

  const activate = (row: T) => {
    if (onRowClick) onRowClick(row);
    else if (rowHref) navigate(rowHref(row), { state: rowState });
  };
  const interactive = Boolean(onRowClick || rowHref);

  return (
    <>
      <div className="md:scroll-x hidden min-w-0 rounded-sm border border-line bg-sheet md:block">
        <table className="w-full border-collapse text-body">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-paper">
            <tr>
              {columns.map((column) => {
                const active = sort?.replace(/^-/, "") === column.sortKey;
                const direction = active
                  ? sort!.startsWith("-")
                    ? "descending"
                    : "ascending"
                  : "none";
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={column.sortKey ? direction : undefined}
                    className={cn(
                      "h-11 border-b border-line px-3 text-label font-medium whitespace-nowrap text-graphite",
                      column.align === "end" ? "text-end" : "text-start",
                      column.className,
                    )}
                  >
                    {column.sortKey && onSortChange ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSortChange(
                            active && !sort!.startsWith("-")
                              ? `-${column.sortKey}`
                              : column.sortKey!,
                          )
                        }
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded-xs px-1 hover:text-ink",
                          active && "text-ink",
                        )}
                      >
                        {column.header}
                        {direction === "ascending" ? (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                        ) : direction === "descending" ? (
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        ) : (
                          <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading || !rows
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {columns.map((column) => (
                      <td key={column.key} className="h-14 px-3">
                        <Skeleton
                          className={cn("h-3.5", column.align === "end" ? "ms-auto w-16" : "w-3/4")}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={(event) => {
                      if (
                        !interactive ||
                        (event.target as HTMLElement).closest("a,button,[role=menuitem]")
                      )
                        return;
                      activate(row);
                    }}
                    className={cn(
                      "border-b border-line align-middle last:border-0",
                      interactive && "cursor-pointer transition-colors duration-150 hover:bg-paper",
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-3 py-3",
                          column.align === "end" ? "tabular text-end" : "text-start",
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <ul
        aria-label={caption}
        className="divide-y divide-line overflow-hidden rounded-sm border border-line bg-sheet md:hidden"
      >
        {loading || !rows
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </li>
            ))
          : rows.map((row) => (
              <li key={getRowId(row)}>
                {rowHref ? (
                  <Link
                    to={rowHref(row)}
                    state={rowState}
                    className="block p-4 transition-colors duration-150 hover:bg-paper"
                  >
                    {mobileRow(row)}
                  </Link>
                ) : onRowClick ? (
                  <button
                    type="button"
                    onClick={() => onRowClick(row)}
                    className="block w-full p-4 text-start hover:bg-paper"
                  >
                    {mobileRow(row)}
                  </button>
                ) : (
                  <div className="p-4">{mobileRow(row)}</div>
                )}
              </li>
            ))}
      </ul>
    </>
  );
}

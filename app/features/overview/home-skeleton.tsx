import { Skeleton } from "~/components/ui/skeleton";

/** Home loading state at the real layout size (no layout shift). */
export function HomeSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border-[1.5px] border-line-strong bg-line lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-sheet p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-sm border border-line bg-sheet p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "./Skeleton";

export function ControlsSkeleton() {
  return (
    <section
      className="shrink-0 mb-6 rounded-xl border border-slate-200/60 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-900 shadow-sm overflow-hidden"
      aria-busy
    >
      {/* Row 1: Metric pills */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <Skeleton className="h-3 w-14 mb-2" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Row 2: Region / Income */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-4">
        <Skeleton className="h-3 w-16 shrink-0" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 shrink-0" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14 shrink-0" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-32 ml-auto shrink-0" />
      </div>

      {/* Row 3: Country combobox */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </section>
  );
}

import { Skeleton } from "./skeletons";
import { MAX_VISIBLE_LINES } from "../constants/metrics";

interface DashboardIntroProps {
  isLoading: boolean;
}

export function DashboardIntro({ isLoading }: DashboardIntroProps) {
  if (isLoading) {
    return (
      <header className="shrink-0 mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </header>
    );
  }
  return (
    <header className="shrink-0 mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
        Explore the data
      </h2>
      <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed max-w-2xl">
        Select a metric and countries for the time series chart; use region and
        income filters below. The scatter plot shows GDP growth vs life
        expectancy with bubble size for poverty—hover for details. Up to{" "}
        {MAX_VISIBLE_LINES} countries on the line chart.
      </p>
    </header>
  );
}

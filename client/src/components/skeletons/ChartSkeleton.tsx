import { useId } from "react";
import { Skeleton } from "./Skeleton";

interface ChartSkeletonProps {
  /** Height of the whole block (e.g. "80vh") */
  height?: string;
  className?: string;
}

export function ChartSkeleton({
  height = "80vh",
  className = "",
}: ChartSkeletonProps) {
  const gradientId = useId().replace(/:/g, "-");
  return (
    <section
      className={`min-w-0 ${className}`.trim()}
      style={{ height }}
      aria-busy
    >
      <div className="chart-card h-full flex flex-col overflow-hidden">
        {/* Title row */}
        <div className="shrink-0 flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>

        {/* Chart area with fake axes and lines */}
        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden bg-slate-100/50 dark:bg-zinc-800/50">
          <svg
            className="w-full h-full text-slate-200 dark:text-zinc-600"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0.2"
                />
              </linearGradient>
            </defs>
            {/* Y axis */}
            <line
              x1={8}
              y1={5}
              x2={8}
              y2={92}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
            {/* X axis */}
            <line
              x1={8}
              y1={92}
              x2={98}
              y2={92}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
            {/* Animated trend lines (draw then reset) — path coords must be numbers, not % */}
            <path
              className="skeleton-chart-line"
              pathLength={1}
              d="M 10 85 Q 30 70 50 55 T 90 25"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ animationDelay: "0s" }}
            />
            <path
              className="skeleton-chart-line"
              pathLength={1}
              d="M 10 75 Q 35 65 55 50 T 90 35"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
              style={{ animationDelay: "0.35s" }}
            />
            <path
              className="skeleton-chart-line"
              pathLength={1}
              d="M 10 90 Q 40 80 60 60 T 90 45"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
              style={{ animationDelay: "0.7s" }}
            />
            <path
              className="skeleton-chart-line"
              pathLength={1}
              d="M 10 78 Q 38 62 58 48 T 90 28"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.55"
              style={{ animationDelay: "1.05s" }}
            />
          </svg>
          {/* Shimmer overlay on the chart area */}
          <div
            className="absolute inset-0 skeleton rounded-lg pointer-events-none opacity-30"
            aria-hidden
          />
        </div>

        {/* Legend row */}
        <div className="shrink-0 flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Skeleton } from "./Skeleton";

/** Fake bubble positions (cx, cy, r) in 0–100 viewBox – scatter-like layout */
const FAKE_BUBBLES = [
  { cx: 18, cy: 72, r: 6 },
  { cx: 32, cy: 58, r: 9 },
  { cx: 48, cy: 42, r: 12 },
  { cx: 62, cy: 65, r: 7 },
  { cx: 78, cy: 38, r: 10 },
  { cx: 24, cy: 48, r: 8 },
  { cx: 55, cy: 28, r: 5 },
  { cx: 72, cy: 78, r: 11 },
  { cx: 38, cy: 82, r: 7 },
  { cx: 85, cy: 55, r: 9 },
];

const BUBBLE_COLORS = [
  "rgba(14, 165, 233, 0.5)",
  "rgba(139, 92, 246, 0.5)",
  "rgba(16, 185, 129, 0.5)",
  "rgba(245, 158, 11, 0.5)",
  "rgba(239, 68, 68, 0.5)",
  "rgba(236, 72, 153, 0.5)",
  "rgba(6, 182, 212, 0.5)",
  "rgba(100, 116, 139, 0.5)",
];

interface BubbleChartSkeletonProps {
  height?: string;
  className?: string;
}

export function BubbleChartSkeleton({
  height = "80vh",
  className = "",
}: BubbleChartSkeletonProps) {
  return (
    <section
      className={`min-w-0 ${className}`.trim()}
      style={{ height }}
      aria-busy
    >
      <div className="chart-card h-full flex flex-col overflow-hidden">
        {/* Title row */}
        <div className="shrink-0 flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Chart area: axes + animated fake bubbles */}
        <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden bg-slate-100/50 dark:bg-zinc-800/50">
          <svg
            className="w-full h-full text-slate-200 dark:text-zinc-600"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
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
            {/* Fake bubbles with pulse + staggered delay */}
            {FAKE_BUBBLES.map((b, i) => (
              <g
                key={i}
                className="skeleton-bubble"
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                <circle
                  cx={b.cx}
                  cy={b.cy}
                  r={b.r}
                  fill={BUBBLE_COLORS[i % BUBBLE_COLORS.length]}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                  className="dark:stroke-zinc-700"
                />
              </g>
            ))}
          </svg>
          <div
            className="absolute inset-0 skeleton rounded-lg pointer-events-none opacity-20"
            aria-hidden
          />
        </div>

        {/* Legend row – region-style dots */}
        <div className="shrink-0 flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-4 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

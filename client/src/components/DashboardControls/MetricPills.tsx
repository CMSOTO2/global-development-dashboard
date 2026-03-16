import { METRICS } from "../../constants/metrics";
import type { MetricKey } from "../../constants/metrics";

interface MetricPillsProps {
  metric: MetricKey;
  onMetricChange: (value: MetricKey) => void;
}

export function MetricPills({ metric, onMetricChange }: MetricPillsProps) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 mb-2">
        Metric
      </p>
      <div className="flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.value}
            onClick={() => onMetricChange(m.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              metric === m.value
                ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-500"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

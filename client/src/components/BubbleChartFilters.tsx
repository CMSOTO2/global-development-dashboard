const SELECT_CLS =
  "rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export interface BubbleChartFiltersProps {
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  incomeFilter: string;
  onIncomeFilterChange: (value: string) => void;
  regions: string[];
  incomes: string[];
  /** Number of countries (or bubbles) shown after filters */
  countryCount: number;
}

export function BubbleChartFilters({
  regionFilter,
  onRegionFilterChange,
  incomeFilter,
  onIncomeFilterChange,
  regions,
  incomes,
  countryCount,
}: BubbleChartFiltersProps) {
  return (
    <section className="shrink-0 mb-4 rounded-xl border border-slate-200/60 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 shrink-0">
          Narrow by
        </p>
        <div className="flex items-center gap-2">
          <label
            htmlFor="scatter-region"
            className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
          >
            Region
          </label>
          <select
            id="scatter-region"
            value={regionFilter}
            onChange={(e) => onRegionFilterChange(e.target.value)}
            className={SELECT_CLS}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="scatter-income"
            className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
          >
            Income
          </label>
          <select
            id="scatter-income"
            value={incomeFilter}
            onChange={(e) => onIncomeFilterChange(e.target.value)}
            className={SELECT_CLS}
          >
            {incomes.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400 dark:text-zinc-500 ml-auto shrink-0">
          {countryCount} countries on chart
        </p>
      </div>
    </section>
  );
}

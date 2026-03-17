import { SELECT_CLS } from "./selectStyles";

interface NarrowByFiltersProps {
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  incomeFilter: string;
  onIncomeFilterChange: (value: string) => void;
  regions: string[];
  incomes: string[];
  countryCount: number;
}

export function NarrowByFilters({
  regionFilter,
  onRegionFilterChange,
  incomeFilter,
  onIncomeFilterChange,
  regions,
  incomes,
  countryCount,
}: NarrowByFiltersProps) {
  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 shrink-0">
        Narrow by
      </p>
      <div className="flex items-center gap-2">
        <label
          htmlFor="region"
          className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
        >
          Region
        </label>
        <select
          id="region"
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
          htmlFor="income"
          className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
        >
          Income
        </label>
        <select
          id="income"
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
        {countryCount} countries match filters
      </p>
    </div>
  );
}

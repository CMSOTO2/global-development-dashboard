import type { MetricKey } from "../../constants/metrics";
import { MetricPills } from "./MetricPills";
import { NarrowByFilters } from "./NarrowByFilters";
import { CountryCombobox } from "./CountryCombobox";

export interface DashboardControlsProps {
  metric: MetricKey;
  onMetricChange: (value: MetricKey) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  incomeFilter: string;
  onIncomeFilterChange: (value: string) => void;
  selectedCountryCodes: Set<string>;
  onAddCountry: (code: string) => void;
  onRemoveCountry: (code: string) => void;
  regions: string[];
  incomes: string[];
  countryOptions: { code: string; name: string }[];
}

export function DashboardControls({
  metric,
  onMetricChange,
  regionFilter,
  onRegionFilterChange,
  incomeFilter,
  onIncomeFilterChange,
  selectedCountryCodes,
  onAddCountry,
  onRemoveCountry,
  regions,
  incomes,
  countryOptions,
}: DashboardControlsProps) {
  return (
    <section className="shrink-0 mb-6 rounded-xl border border-slate-200/60 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-900 shadow-sm overflow-hidden">
      <MetricPills metric={metric} onMetricChange={onMetricChange} />
      <NarrowByFilters
        regionFilter={regionFilter}
        onRegionFilterChange={onRegionFilterChange}
        incomeFilter={incomeFilter}
        onIncomeFilterChange={onIncomeFilterChange}
        regions={regions}
        incomes={incomes}
        countryCount={countryOptions.length}
      />
      <CountryCombobox
        selectedCountryCodes={selectedCountryCodes}
        onAddCountry={onAddCountry}
        onRemoveCountry={onRemoveCountry}
        countryOptions={countryOptions}
      />
    </section>
  );
}

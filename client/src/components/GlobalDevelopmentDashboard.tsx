import { useMemo, useState, useCallback } from "react";
import { useEconomicHistoryQuery } from "../queries/useEconomicHistoryQuery";
import { useEconomicLatestQuery } from "../queries/useEconomicLatestQuery";
import {
  METRICS,
  DEFAULT_COUNTRY_CODES,
  MAX_VISIBLE_LINES,
  type MetricKey,
} from "../constants/metrics";
import { VisxLineChart } from "./charts/VisxLineChart";
import { GapminderScatterChart } from "./charts/GapminderScatterChart";

function getUnique<T>(items: T[], key: (t: T) => string): string[] {
  const set = new Set<string>();
  for (const item of items) set.add(key(item));
  return Array.from(set).sort();
}

export function GlobalDevelopmentDashboard() {
  const { data: historyData, isLoading: historyLoading, error: historyError } = useEconomicHistoryQuery();
  const { data: latestData, isLoading: latestLoading, error: latestError } = useEconomicLatestQuery();

  const [metric, setMetric] = useState<MetricKey>("gdp_growth");
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const [incomeFilter, setIncomeFilter] = useState<string>("All");
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(
    () => new Set(DEFAULT_COUNTRY_CODES),
  );

  const regions = useMemo(
    () => (latestData ? ["All", ...getUnique(latestData, (d) => d.region)] : ["All"]),
    [latestData],
  );
  const incomes = useMemo(
    () => (latestData ? ["All", ...getUnique(latestData, (d) => d.income)] : ["All"]),
    [latestData],
  );

  const filteredLatest = useMemo(() => {
    if (!latestData) return [];
    return latestData.filter((row) => {
      if (regionFilter !== "All" && row.region !== regionFilter) return false;
      if (incomeFilter !== "All" && row.income !== incomeFilter) return false;
      if (countrySearch.trim()) {
        const q = countrySearch.trim().toLowerCase();
        if (!row.country.toLowerCase().includes(q) && !row.country_code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [latestData, regionFilter, incomeFilter, countrySearch]);

  const countryOptions = useMemo(
    () => filteredLatest.map((r) => ({ code: r.country_code, name: r.country })),
    [filteredLatest],
  );

  const toggleCountry = useCallback((code: string) => {
    setSelectedCountryCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else if (next.size < MAX_VISIBLE_LINES) next.add(code);
      return next;
    });
  }, []);

  const lineChartSeries = useMemo(() => {
    if (!historyData) return [];
    const codes = Array.from(selectedCountryCodes).slice(0, MAX_VISIBLE_LINES);
    return codes.map((countryCode) => {
      const country = historyData.find((c) => c.country_code === countryCode);
      if (!country?.data?.length)
        return { countryCode, countryName: country?.country ?? countryCode, points: [] };
      const points = country.data
        .filter((d) => Number.isFinite(d[metric]))
        .map((d) => ({ year: d.year, value: d[metric] as number }))
        .sort((a, b) => a.year - b.year);
      return { countryCode, countryName: country.country, points };
    });
  }, [historyData, selectedCountryCodes, metric]);

  const metricConfig = METRICS.find((m) => m.value === metric) ?? METRICS[0];
  const isLoading = historyLoading || latestLoading;
  const error = historyError ?? latestError;

  if (isLoading) return <div className="p-8 text-slate-600 dark:text-zinc-400">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">Error: {(error as Error).message}</div>;

  return (
    <div className="min-w-0">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Global Development Dashboard
          </h1>
          <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
            Time series by country. Switch metric, filter by region/income, and add or remove countries via search. Max {MAX_VISIBLE_LINES} lines at once.
          </p>
        </header>

        {/* Controls: metric + filters */}
        <section className="mb-6 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">Metric:</span>
            <select
              id="metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              className="rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3 py-1.5 text-sm min-w-[160px]"
            >
              {METRICS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-400 ml-2">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3 py-1.5 text-sm min-w-[140px]"
            >
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">Income:</span>
            <select
              value={incomeFilter}
              onChange={(e) => setIncomeFilter(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3 py-1.5 text-sm min-w-[120px]"
            >
              {incomes.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">Country search:</span>
            <input
              type="search"
              placeholder="Search to add/remove countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 px-3 py-1.5 text-sm w-full max-w-[220px]"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">
              Countries for line chart (max {MAX_VISIBLE_LINES}); check to add, uncheck to remove:
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 max-h-28 overflow-y-auto">
              {countryOptions.slice(0, 100).map(({ code, name }) => (
                <label key={code} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={selectedCountryCodes.has(code)}
                    onChange={() => toggleCountry(code)}
                    disabled={!selectedCountryCodes.has(code) && selectedCountryCodes.size >= MAX_VISIBLE_LINES}
                    className="rounded border-slate-400"
                  />
                  <span>{name} ({code})</span>
                </label>
              ))}
              {countryOptions.length > 100 && (
                <span className="text-xs text-slate-500 dark:text-zinc-400">+{countryOptions.length - 100} more (narrow filters)</span>
              )}
            </div>
          </div>
        </section>

        {/* Main chart: time series line */}
        <section className="mb-8 min-w-0">
          <VisxLineChart
            series={lineChartSeries}
            title={`${metricConfig.label} Over Time`}
            valueFormat={metricConfig.format}
          />
        </section>

        {/* Optional: Gapminder-style scatter */}
        <section className="min-w-0">
          <GapminderScatterChart data={filteredLatest} />
        </section>
      </div>
    </div>
  );
}

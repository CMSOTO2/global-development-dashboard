import { useMemo, useState, useCallback } from "react";
import { useEconomicHistoryQuery } from "../queries/useEconomicHistoryQuery";
import { useEconomicLatestQuery } from "../queries/useEconomicLatestQuery";
import {
  METRICS,
  DEFAULT_COUNTRY_CODES,
  MAX_VISIBLE_LINES,
  type MetricKey,
} from "../constants/metrics";
import { DashboardControls } from "./DashboardControls";
import { BubbleChartFilters } from "./BubbleChartFilters";
import { VisxLineChart } from "./charts/VisxLineChart";
import { GapminderScatterChart } from "./charts/GapminderScatterChart";
import {
  BubbleChartSkeleton,
  ChartSkeleton,
  ControlsSkeleton,
  Skeleton,
} from "./skeletons";

function getUnique<T>(items: T[], key: (t: T) => string): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = key(item);
    if (v != null && typeof v === "string") set.add(v.trim());
  }
  return Array.from(set).sort();
}

export function GlobalDevelopmentDashboard() {
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useEconomicHistoryQuery();
  const {
    data: latestData,
    isLoading: latestLoading,
    error: latestError,
  } = useEconomicLatestQuery();

  const [metric, setMetric] = useState<MetricKey>("gdp_growth");
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const [incomeFilter, setIncomeFilter] = useState<string>("All");
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(
    () => new Set(DEFAULT_COUNTRY_CODES),
  );

  const regions = useMemo(
    () =>
      latestData ? ["All", ...getUnique(latestData, (d) => d.region)] : ["All"],
    [latestData],
  );
  const incomes = useMemo(
    () =>
      latestData ? ["All", ...getUnique(latestData, (d) => d.income)] : ["All"],
    [latestData],
  );

  const filteredLatest = useMemo(() => {
    if (!latestData) return [];
    const region = regionFilter.trim();
    const income = incomeFilter.trim();
    return latestData.filter((row) => {
      if (
        region !== "" &&
        region !== "All" &&
        (row.region ?? "").trim() !== region
      )
        return false;
      if (
        income !== "" &&
        income !== "All" &&
        (row.income ?? "").trim() !== income
      )
        return false;
      return true;
    });
  }, [latestData, regionFilter, incomeFilter]);

  /** One row per country for the scatter chart so region/income filters show exactly that set */
  const scatterData = useMemo(() => {
    const seen = new Set<string>();
    return filteredLatest.filter((row) => {
      if (seen.has(row.country_code)) return false;
      seen.add(row.country_code);
      return true;
    });
  }, [filteredLatest]);

  const countryOptions = useMemo(() => {
    const seen = new Set<string>();
    return filteredLatest
      .filter((r) => {
        if (seen.has(r.country_code)) return false;
        seen.add(r.country_code);
        return true;
      })
      .map((r) => ({ code: r.country_code, name: r.country }));
  }, [filteredLatest]);

  const addCountry = useCallback((code: string) => {
    setSelectedCountryCodes((prev) => {
      if (prev.has(code) || prev.size >= MAX_VISIBLE_LINES) return prev;
      const next = new Set(prev);
      next.add(code);
      return next;
    });
  }, []);

  const removeCountry = useCallback((code: string) => {
    setSelectedCountryCodes((prev) => {
      if (!prev.has(code)) return prev;
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  const lineChartSeries = useMemo(() => {
    if (!historyData) return [];
    const codes = Array.from(selectedCountryCodes).slice(0, MAX_VISIBLE_LINES);
    return codes.map((countryCode) => {
      const country = historyData.find((c) => c.country_code === countryCode);
      if (!country?.data?.length)
        return {
          countryCode,
          countryName: country?.country ?? countryCode,
          points: [],
        };
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

  if (error)
    return (
      <div className="p-8 text-red-600 dark:text-red-400">
        Error: {(error as Error).message}
      </div>
    );

  return (
    <div className="min-w-0">
      <div className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8 min-w-0">
        <header className="shrink-0 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-72 mb-2" />
              <Skeleton className="h-4 w-full max-w-md" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                Global Development Dashboard
              </h1>
              <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
                Time series by country. Switch metric, filter by region/income,
                and add or remove countries via search. Max {MAX_VISIBLE_LINES}{" "}
                lines at once.
              </p>
            </>
          )}
        </header>

        {isLoading ? (
          <ControlsSkeleton />
        ) : (
          <DashboardControls
            metric={metric}
            onMetricChange={setMetric}
            regionFilter={regionFilter}
            onRegionFilterChange={setRegionFilter}
            incomeFilter={incomeFilter}
            onIncomeFilterChange={setIncomeFilter}
            selectedCountryCodes={selectedCountryCodes}
            onAddCountry={addCountry}
            onRemoveCountry={removeCountry}
            regions={regions}
            incomes={incomes}
            countryOptions={countryOptions}
          />
        )}

        {/* Main chart: time series line */}
        {isLoading ? (
          <ChartSkeleton height="80vh" className="mb-6" />
        ) : (
          <section className="min-w-0 mb-6" style={{ height: "80vh" }}>
            <VisxLineChart
              series={lineChartSeries}
              title={`${metricConfig.label} Over Time`}
              valueFormat={metricConfig.format}
            />
          </section>
        )}

        {/* Gapminder-style scatter */}
        {isLoading ? (
          <BubbleChartSkeleton height="80vh" />
        ) : (
          <>
            <BubbleChartFilters
              regionFilter={regionFilter}
              onRegionFilterChange={setRegionFilter}
              incomeFilter={incomeFilter}
              onIncomeFilterChange={setIncomeFilter}
              regions={regions}
              incomes={incomes}
              countryCount={scatterData.length}
            />
            <section className="min-w-0" style={{ height: "80vh" }}>
              <GapminderScatterChart data={scatterData} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

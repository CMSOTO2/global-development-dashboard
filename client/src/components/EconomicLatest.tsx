import { useCallback, useMemo } from "react";
import { useEconomicLatestQuery } from "../queries/useEconomicLatestQuery";
import type { EconomicLatest as EconomicLatestType } from "../../../shared/types";
import { VisxBarChart } from "./charts/VisxBarChart";
import { VisxScatterChart } from "./charts/VisxScatterChart";

function toBarData(
  items: EconomicLatestType[],
  valueKey: keyof Pick<
    EconomicLatestType,
    "gdp_growth" | "inflation" | "life_expectancy" | "poverty"
  >,
) {
  return items.map((item) => ({
    label: item.country_code,
    value: item[valueKey] ?? 0,
  }));
}

function toScatterData(items: EconomicLatestType[]) {
  return items.map((item) => ({
    id: item.country_code,
    label: item.country,
    x: item.gdp_growth,
    y: item.inflation,
  }));
}

function toRegionBarData(items: EconomicLatestType[]) {
  const byRegion = new Map<string, { sum: number; count: number }>();
  for (const item of items) {
    const r = item.region || "Other";
    const cur = byRegion.get(r) ?? { sum: 0, count: 0 };
    cur.sum += item.gdp_growth;
    cur.count += 1;
    byRegion.set(r, cur);
  }
  return Array.from(byRegion.entries())
    .map(([region, { sum, count }]) => ({
      label: region,
      value: count > 0 ? sum / count : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export const EconomicLatest = () => {
  const { data, isLoading, error } = useEconomicLatestQuery();

  const gdpBarData = useMemo(
    () => (data ? toBarData(data, "gdp_growth") : []),
    [data],
  );
  const inflationBarData = useMemo(
    () => (data ? toBarData(data, "inflation") : []),
    [data],
  );
  const scatterData = useMemo(() => (data ? toScatterData(data) : []), [data]);
  const lifeExpectancyData = useMemo(
    () => (data ? toBarData(data, "life_expectancy") : []),
    [data],
  );
  const regionBarData = useMemo(
    () => (data ? toRegionBarData(data) : []),
    [data],
  );

  const pctFormat = useCallback((n: number) => `${n.toFixed(1)}%`, []);
  const intFormat = useCallback((n: number) => String(Math.round(n)), []);

  if (isLoading)
    return (
      <div className="p-4 text-slate-600 dark:text-zinc-400">Loading...</div>
    );
  if (error)
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Error: {error.message}
      </div>
    );
  if (!data?.length)
    return (
      <div className="p-4 text-slate-600 dark:text-zinc-400">
        No economic latest data.
      </div>
    );

  return (
    <div className="bg-linear-to-b from-slate-100 to-slate-50 dark:from-zinc-950 dark:to-zinc-900/50 transition-colors min-w-0">
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8 min-w-0">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Economic Latest
          </h1>
          <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
            Latest indicators by country — hover for details. Built with{" "}
            <a
              href="https://airbnb.io/visx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              visx
            </a>
            .
          </p>
        </header>

        {/* Top row: GDP & Inflation */}
        <section className="grid gap-6 sm:gap-8 md:grid-cols-2 mb-8 min-w-0">
          <div className="min-h-[280px] w-full min-w-0">
            <VisxBarChart
              data={gdpBarData}
              title="GDP growth (%)"
              valueFormat={pctFormat}
              color="#0ea5e9"
            />
          </div>
          <div className="min-h-[280px] w-full min-w-0">
            <VisxBarChart
              data={inflationBarData}
              title="Inflation (%)"
              valueFormat={pctFormat}
              color="#8b5cf6"
            />
          </div>
        </section>

        {/* Scatter: GDP vs Inflation */}
        <section className="mb-8 min-w-0">
          <div className="min-h-[320px] w-full min-w-0">
            <VisxScatterChart
              data={scatterData}
              title="GDP growth vs inflation"
              xLabel="GDP growth (%)"
              yLabel="Inflation (%)"
              xFormat={pctFormat}
              yFormat={pctFormat}
            />
          </div>
        </section>

        {/* Life expectancy & Region average GDP */}
        <section className="grid gap-6 sm:gap-8 md:grid-cols-2 mb-8 min-w-0">
          <div className="min-h-[280px] w-full min-w-0">
            <VisxBarChart
              data={lifeExpectancyData}
              title="Life expectancy (years)"
              valueFormat={intFormat}
              color="#10b981"
            />
          </div>
          <div className="min-h-[280px] w-full min-w-0">
            <VisxBarChart
              data={regionBarData}
              title="Avg. GDP growth by region (%)"
              valueFormat={pctFormat}
              color="#f59e0b"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

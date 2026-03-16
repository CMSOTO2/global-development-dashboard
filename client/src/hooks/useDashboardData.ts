import { useMemo, useState, useCallback } from "react";
import { useEconomicHistoryQuery } from "../queries/useEconomicHistoryQuery";
import { useEconomicLatestQuery } from "../queries/useEconomicLatestQuery";
import {
  METRICS,
  DEFAULT_COUNTRY_CODES,
  MAX_VISIBLE_LINES,
  type MetricKey,
} from "../constants/metrics";
import type { LineSeries } from "../components/charts/VisxLineChart";
import type { EconomicLatest, EconomicHistory } from "../../../shared/types";

function getUnique<T>(items: T[], key: (t: T) => string): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = key(item);
    if (v != null && typeof v === "string") set.add(v.trim());
  }
  return Array.from(set).sort();
}

export interface UseDashboardDataResult {
  metric: MetricKey;
  setMetric: (v: MetricKey) => void;
  regionFilter: string;
  setRegionFilter: (v: string) => void;
  incomeFilter: string;
  setIncomeFilter: (v: string) => void;
  selectedCountryCodes: Set<string>;
  addCountry: (code: string) => void;
  removeCountry: (code: string) => void;
  regions: string[];
  incomes: string[];
  countryOptions: { code: string; name: string }[];
  lineChartSeries: LineSeries[];
  scatterData: EconomicLatest[];
  historyData: EconomicHistory[] | undefined;
  metricConfig: (typeof METRICS)[number];
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardData(): UseDashboardDataResult {
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

  const lineChartSeries = useMemo((): LineSeries[] => {
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
  const error = historyError ?? latestError ?? null;

  return {
    metric,
    setMetric,
    regionFilter,
    setRegionFilter,
    incomeFilter,
    setIncomeFilter,
    selectedCountryCodes,
    addCountry,
    removeCountry,
    regions,
    incomes,
    countryOptions,
    lineChartSeries,
    scatterData,
    historyData,
    metricConfig,
    isLoading,
    error,
  };
}

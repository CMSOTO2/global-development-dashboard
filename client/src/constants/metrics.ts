import type { EconomicHistoryData } from "../../../shared/types";

export type MetricKey = keyof Pick<
  EconomicHistoryData,
  "gdp_growth" | "inflation" | "life_expectancy" | "poverty"
>;

export const METRICS: { value: MetricKey; label: string; format: (n: number) => string }[] = [
  { value: "gdp_growth", label: "GDP Growth", format: (n) => `${n.toFixed(1)}%` },
  { value: "inflation", label: "Inflation", format: (n) => `${n.toFixed(1)}%` },
  { value: "life_expectancy", label: "Life Expectancy", format: (n) => `${Math.round(n)} yrs` },
  { value: "poverty", label: "Poverty Rate", format: (n) => `${n.toFixed(1)}%` },
];

/** Default 5–10 countries for a clean initial view. */
export const DEFAULT_COUNTRY_CODES = [
  "USA",
  "CHN",
  "IND",
  "DEU",
  "BRA",
  "GBR",
  "FRA",
  "JPN",
];

/** Never render more than 10–15 country lines at once. */
export const MAX_VISIBLE_LINES = 15;
export const FADED_LINE_OPACITY = 0.2;

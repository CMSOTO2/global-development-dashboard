import type { EconomicHistoryData } from "../../../shared/types";

export type MetricKey = keyof Pick<
  EconomicHistoryData,
  | "gdp_growth"
  | "inflation"
  | "life_expectancy"
  | "poverty"
  | "population"
  | "population_growth"
>;

function formatPopulation(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

export const METRICS: {
  value: MetricKey;
  label: string;
  format: (n: number) => string;
}[] = [
  {
    value: "gdp_growth",
    label: "GDP Growth",
    format: (n) => `${n.toFixed(1)}%`,
  },
  { value: "inflation", label: "Inflation", format: (n) => `${n.toFixed(1)}%` },
  {
    value: "life_expectancy",
    label: "Life Expectancy",
    format: (n) => `${Math.round(n)} yrs`,
  },
  {
    value: "poverty",
    label: "Poverty Rate",
    format: (n) => `${n.toFixed(1)}%`,
  },
  { value: "population", label: "Population", format: formatPopulation },
  {
    value: "population_growth",
    label: "Population Growth",
    format: (n) => `${n.toFixed(1)}%`,
  },
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

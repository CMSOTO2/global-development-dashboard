export interface EconomicHistoryData {
  year: number;
  gdp_growth: number;
  inflation: number;
  life_expectancy: number;
  poverty: number | null;
}

export interface EconomicHistory {
  country: string;
  country_code: string;
  region: string;
  income: string;
  latitude: number;
  longitude: number;
  data: EconomicHistoryData[];
}

export interface EconomicLatest extends EconomicHistoryData {
  country: string;
  country_code: string;
  region: string;
  income: string;
  latitude: number;
  longitude: number;
}

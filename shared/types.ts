export interface GDPData {
  country: string;
  year: number;
  gdp: number;
}

export interface EconomicHistory {
  country_code: string;
  country_name: string;
  region: string;
  income: string;
  year: number;
  gdp_growth: number;
  inflation: number;
  life_expectancy: number;
  poverty: number;
}

export interface EconomicLatest extends EconomicHistory {}

export interface LineSeriesPoint {
  year: number;
  value: number;
}

export interface LineSeries {
  countryCode: string;
  countryName: string;
  points: LineSeriesPoint[];
}

export interface VisxLineChartProps {
  series: LineSeries[];
  title: string;
  valueFormat: (n: number) => string;
}

export const DEFAULT_MARGIN = { top: 24, right: 24, bottom: 36, left: 56 };
export const NARROW_MARGIN = { top: 20, right: 12, bottom: 28, left: 40 };
export const NARROW_BREAKPOINT = 420;
export const TITLE_BLOCK_HEIGHT = 52;
export const LEGEND_HEIGHT = 44;

export const LINE_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#eab308",
  "#22c55e",
  "#3b82f6",
];

export function getMargin(width: number) {
  return width >= NARROW_BREAKPOINT ? DEFAULT_MARGIN : NARROW_MARGIN;
}

"use client";

import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ParentSize } from "@visx/responsive";
import { Mercator, Graticule } from "@visx/geo";
import { scaleQuantize } from "@visx/scale";
import * as topojson from "topojson-client";
import type {
  EconomicHistory,
  EconomicHistoryData,
} from "../../../../shared/types";
import { useTheme } from "../../contexts/ThemeContext";
import { useWorldTopologyQuery } from "../../queries/useWorldTopologyQuery";

/** Same as visx geo-mercator example */
export const BACKGROUND = "#f9f7e8";
const BACKGROUND_DARK = "#27272a";

const NO_DATA_COLOR = "#cbd5e1";
const NO_DATA_COLOR_DARK = "#3f3f46";
/** Sequential: low (teal) → high (rose). Clear and distinct from previous blue-amber. */
const DATA_COLOR_RANGE = [
  "#0f766e",
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#f472b6",
  "#ec4899",
  "#db2777",
  "#be185d",
];

interface FeatureShape {
  type: string;
  geometry: { type: string; coordinates: unknown[] | unknown[][][] };
  properties?: { name?: string };
  id?: string;
}

type MapMetric = keyof Pick<
  EconomicHistoryData,
  "gdp_growth" | "poverty" | "inflation" | "life_expectancy"
>;

const MAP_METRICS: { value: MapMetric; label: string }[] = [
  { value: "gdp_growth", label: "GDP growth" },
  { value: "poverty", label: "Poverty" },
  { value: "inflation", label: "Inflation" },
  { value: "life_expectancy", label: "Life expectancy" },
];

function formatMetricValue(metric: MapMetric, value: number): string {
  if (metric === "life_expectancy") return `${Math.round(value)} yrs`;
  return `${value.toFixed(1)}%`;
}

function getMetricLabel(metric: MapMetric): string {
  const m = MAP_METRICS.find((x) => x.value === metric);
  return m ? m.label : metric;
}

interface GeoMercatorChartProps {
  historyData: EconomicHistory[] | undefined;
}

/** Match topology feature name to history country (world-atlas names can differ slightly) */
function findHistoryByFeatureName(
  historyData: EconomicHistory[] | undefined,
  featureName: string | undefined,
): EconomicHistory | undefined {
  if (!historyData?.length || !featureName?.trim()) return undefined;
  const name = featureName.trim();
  const exact = historyData.find((h) => h.country.trim() === name);
  if (exact) return exact;
  return historyData.find(
    (h) =>
      h.country.trim().toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(h.country.trim().toLowerCase()),
  );
}

/** All years present in history data (for global year dropdown) */
function getAllYears(historyData: EconomicHistory[] | undefined): number[] {
  if (!historyData?.length) return [];
  const set = new Set<number>();
  historyData.forEach((h) => h.data?.forEach((d) => set.add(d.year)));
  return [...set].sort((a, b) => a - b);
}

const InnerGeoMercator = memo(function InnerGeoMercator({
  width,
  height,
  historyData,
  dark,
}: GeoMercatorChartProps & { width: number; height: number; dark: boolean }) {
  const { data: topology } = useWorldTopologyQuery();
  const [hoveredFeature, setHoveredFeature] = useState<FeatureShape | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const allYears = useMemo(() => getAllYears(historyData), [historyData]);
  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    allYears.length > 0 ? allYears[allYears.length - 1] : null,
  );
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>("gdp_growth");

  const world = useMemo(() => {
    if (!topology?.objects?.countries) return null;
    const fc = topojson.feature(topology, topology.objects.countries);
    return fc as unknown as { features: FeatureShape[] };
  }, [topology]);

  /** Per-feature value for selected year and metric. Null if no data. */
  const featureValues = useMemo(() => {
    if (
      !world?.features?.length ||
      selectedYear == null ||
      !historyData?.length
    )
      return new Map<string, number>();
    const map = new Map<string, number>();
    world.features.forEach((f) => {
      const history = findHistoryByFeatureName(historyData, f.properties?.name);
      const row = history?.data?.find((d) => d.year === selectedYear);
      const value = row?.[selectedMetric];
      if (value != null && Number.isFinite(value)) {
        map.set(f.properties?.name ?? String(map.size), value);
      }
    });
    return map;
  }, [world, historyData, selectedYear, selectedMetric]);

  /** Data-driven color scale for selected metric (low = cool, high = warm) */
  const colorScale = useMemo(() => {
    const values = [...featureValues.values()];
    if (values.length === 0) return () => NO_DATA_COLOR;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max)
      return () => DATA_COLOR_RANGE[DATA_COLOR_RANGE.length >> 1];
    return scaleQuantize({
      domain: [min, max],
      range: DATA_COLOR_RANGE,
    });
  }, [featureValues]);

  const noDataFill = dark ? NO_DATA_COLOR_DARK : NO_DATA_COLOR;
  const getFill = useCallback(
    (feature: FeatureShape) => {
      const value = featureValues.get(feature.properties?.name ?? "");
      return value != null ? colorScale(value) : noDataFill;
    },
    [featureValues, colorScale, noDataFill],
  );

  const scaleDomain = useMemo(() => {
    const values = [...featureValues.values()];
    if (values.length === 0) return null;
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [featureValues]);

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;
  const translate: [number, number] = [centerX, centerY + 50];

  const bg = dark ? BACKGROUND_DARK : BACKGROUND;

  useEffect(() => {
    if (
      allYears.length > 0 &&
      (selectedYear == null || !allYears.includes(selectedYear))
    ) {
      setSelectedYear(allYears[allYears.length - 1]);
    }
  }, [allYears, selectedYear]);

  const matchedHistory = useMemo(
    () =>
      findHistoryByFeatureName(historyData, hoveredFeature?.properties?.name),
    [historyData, hoveredFeature],
  );

  const selectedYearData = useMemo((): EconomicHistoryData | null => {
    if (!matchedHistory?.data || selectedYear == null) return null;
    const row = matchedHistory.data.find((d) => d.year === selectedYear);
    return row ?? null;
  }, [matchedHistory, selectedYear]);

  const handleFeatureMouseEnter = useCallback(
    (e: React.MouseEvent, feature: FeatureShape) => {
      setHoveredFeature(feature);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleFeatureMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleFeatureMouseLeave = useCallback(() => {
    setHoveredFeature(null);
  }, []);

  if (width < 10 || height < 10) return null;

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden pt-1">
      <div className="shrink-0 flex flex-wrap items-center gap-3 mb-3 pt-2">
        <h2 className="chart-title mb-0">World map</h2>
        {allYears.length > 0 && (
          <>
            <label
              htmlFor="geo-year"
              className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
            >
              Year
            </label>
            <select
              id="geo-year"
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
              className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {allYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label
              htmlFor="geo-metric"
              className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
            >
              Metric
            </label>
            <select
              id="geo-metric"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MapMetric)}
              className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {MAP_METRICS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden">
        <svg width={width} height={height} className="block">
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={bg}
            className="dark:fill-zinc-800"
            rx={14}
          />
          {world && (
            <Mercator
              data={world.features as Parameters<typeof Mercator>[0]["data"]}
              scale={scale}
              translate={translate}
            >
              {(mercator) => (
                <g>
                  <Graticule
                    graticule={(g) => mercator.path(g) ?? ""}
                    stroke={
                      dark ? "rgba(255,255,255,0.06)" : "rgba(33,33,33,0.05)"
                    }
                  />
                  {mercator.features.map(({ feature, path }, i) => (
                    <path
                      key={`map-feature-${i}`}
                      d={path ?? ""}
                      fill={getFill(feature as FeatureShape)}
                      stroke={bg}
                      strokeWidth={0.5}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) =>
                        handleFeatureMouseEnter(e, feature as FeatureShape)
                      }
                      onMouseMove={handleFeatureMouseMove}
                      onMouseLeave={handleFeatureMouseLeave}
                    />
                  ))}
                </g>
              )}
            </Mercator>
          )}
        </svg>
        {hoveredFeature &&
          matchedHistory &&
          createPortal(
            <div
              className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 shadow-xl p-3 min-w-[200px]"
              style={{
                position: "fixed",
                left: Math.min(
                  tooltipPos.x + 12,
                  typeof window !== "undefined"
                    ? window.innerWidth - 220
                    : tooltipPos.x + 12,
                ),
                top: Math.min(
                  tooltipPos.y + 12,
                  typeof window !== "undefined"
                    ? window.innerHeight - 220
                    : tooltipPos.y + 12,
                ),
                zIndex: 1000,
                pointerEvents: "auto",
              }}
              onMouseEnter={(e) => e.stopPropagation()}
            >
              <div className="text-slate-800 dark:text-zinc-100 font-semibold text-sm mb-2">
                {matchedHistory.country}
              </div>
              {selectedYear != null && (
                <div className="text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                  {selectedYear}
                </div>
              )}
              {selectedYearData ? (
                <div className="text-slate-600 dark:text-zinc-400 text-xs space-y-0.5">
                  <div>
                    GDP growth: {selectedYearData.gdp_growth?.toFixed(1) ?? "—"}
                    %
                  </div>
                  <div>
                    Inflation: {selectedYearData.inflation?.toFixed(1) ?? "—"}%
                  </div>
                  <div>
                    Life expectancy:{" "}
                    {selectedYearData.life_expectancy != null
                      ? Math.round(selectedYearData.life_expectancy)
                      : "—"}{" "}
                    yrs
                  </div>
                  <div>
                    Poverty:{" "}
                    {selectedYearData.poverty != null
                      ? `${selectedYearData.poverty.toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  No data for this country in {selectedYear ?? "selected year"}.
                </p>
              )}
            </div>,
            document.body,
          )}
      </div>
      {scaleDomain && (
        <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400">
          <span className="font-medium text-slate-700 dark:text-zinc-300">
            {getMetricLabel(selectedMetric)} ({selectedYear ?? ""})
          </span>
          <span className="flex items-center gap-1.5">
            {DATA_COLOR_RANGE.map((c, i) => (
              <span
                key={i}
                className="inline-block w-4 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
          <span>
            {formatMetricValue(selectedMetric, scaleDomain.min)} (low) →{" "}
            {formatMetricValue(selectedMetric, scaleDomain.max)} (high)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: noDataFill }}
            />
            No data
          </span>
        </div>
      )}
    </div>
  );
});

export function GeoMercatorChart(props: GeoMercatorChartProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0 h-full">
      <div className="w-full flex-1 min-h-0">
        <ParentSize
          debounceTime={120}
          initialSize={{ width: 800, height: 400 }}
        >
          {({ width, height }) =>
            width > 0 && height > 0 ? (
              <InnerGeoMercator
                {...props}
                width={width}
                height={height}
                dark={dark}
              />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

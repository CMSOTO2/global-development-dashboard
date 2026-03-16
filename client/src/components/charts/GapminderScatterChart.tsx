"use client";

import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import type { EconomicLatest } from "../../../../shared/types";

const DEFAULT_MARGIN = { top: 32, right: 24, bottom: 44, left: 52 };
const NARROW_MARGIN = { top: 24, right: 12, bottom: 36, left: 40 };
const NARROW_BREAKPOINT = 420;
const TITLE_AREA_HEIGHT = 40;

const REGION_COLORS: Record<string, string> = {
  "East Asia & Pacific": "#0ea5e9",
  "Europe & Central Asia": "#8b5cf6",
  "Latin America & Caribbean": "#10b981",
  "Middle East & North Africa": "#f59e0b",
  "North America": "#ef4444",
  "South Asia": "#ec4899",
  "Sub-Saharan Africa": "#06b6d4",
  "Other": "#64748b",
};

function getMargin(width: number) {
  return width >= NARROW_BREAKPOINT ? DEFAULT_MARGIN : NARROW_MARGIN;
}

interface GapminderScatterChartProps {
  data: EconomicLatest[];
}

const InnerGapminderScatter = memo(function InnerGapminderScatter({
  width,
  height,
  data,
}: GapminderScatterChartProps & { width: number; height: number }) {
  const valid = useMemo(
    () =>
      data.filter(
        (d) =>
          Number.isFinite(d.gdp_growth) &&
          Number.isFinite(d.life_expectancy) &&
          d.life_expectancy > 0,
      ),
    [data],
  );

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<EconomicLatest>();

  const margin = useMemo(() => getMargin(width), [width]);
  const chartHeight = height - TITLE_AREA_HEIGHT;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xExtent = useMemo(() => {
    const xs = valid.map((d) => d.gdp_growth);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const pad = lo === hi ? 1 : 0;
    return [lo - pad, hi + pad] as [number, number];
  }, [valid]);

  const yExtent = useMemo(() => {
    const ys = valid.map((d) => d.life_expectancy);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = lo === hi ? 1 : 0;
    return [lo - pad, hi + pad] as [number, number];
  }, [valid]);

  const povertyExtent = useMemo(() => {
    const ps = valid
      .map((d) => d.poverty)
      .filter((p): p is number => p != null && Number.isFinite(p));
    if (ps.length === 0) return [0, 1];
    return [Math.min(...ps), Math.max(...ps)];
  }, [valid]);

  const xScale = useMemo(() => scaleLinear<number>({ domain: xExtent, range: [0, innerWidth], round: true }), [xExtent, innerWidth]);
  const yScale = useMemo(() => scaleLinear<number>({ domain: yExtent, range: [innerHeight, 0], round: true }), [yExtent, innerHeight]);
  const radiusScale = useMemo(() => {
    const [pMin, pMax] = povertyExtent;
    return scaleLinear<number>({ domain: [pMin, pMax], range: [4, 24], round: true });
  }, [povertyExtent]);

  if (valid.length === 0 || width < 300 || chartHeight < 10) return null;

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <h2 className="chart-title mb-2 shrink-0" style={{ minHeight: TITLE_AREA_HEIGHT - 8 }}>
        GDP Growth vs Life Expectancy (bubble size: poverty rate, color: region)
      </h2>
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <svg width={width} height={chartHeight} className="block">
          <Group left={margin.left} top={margin.top}>
            {valid.map((d) => {
              const r = d.poverty != null && Number.isFinite(d.poverty) ? radiusScale(d.poverty) : 8;
              const color = REGION_COLORS[d.region] ?? REGION_COLORS["Other"];
              return (
                <circle
                  key={d.country_code}
                  cx={xScale(d.gdp_growth)}
                  cy={yScale(d.life_expectancy)}
                  r={r}
                  fill={color}
                  fillOpacity={0.75}
                  stroke="white"
                  strokeWidth={1.5}
                  className="dark:stroke-zinc-800"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => showTooltip({ tooltipData: d, tooltipLeft: e.clientX, tooltipTop: e.clientY })}
                  onMouseMove={(e) => showTooltip({ tooltipData: d, tooltipLeft: e.clientX, tooltipTop: e.clientY })}
                  onMouseLeave={hideTooltip}
                />
              );
            })}
            <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="currentColor" strokeOpacity={0.4} className="text-slate-400 dark:text-zinc-500" />
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="currentColor" strokeOpacity={0.4} className="text-slate-400 dark:text-zinc-500" />
            {xScale.ticks(5).map((tick) => (
              <text key={tick} x={xScale(tick)} y={innerHeight + 14} textAnchor="middle" fontSize={10} className="fill-slate-500 dark:fill-zinc-400">{tick.toFixed(1)}%</text>
            ))}
            {yScale.ticks(5).map((tick) => (
              <text key={tick} x={-8} y={yScale(tick)} dy="0.35em" textAnchor="end" fontSize={10} className="fill-slate-500 dark:fill-zinc-400">{tick}</text>
            ))}
            <text x={innerWidth / 2} y={innerHeight + 34} textAnchor="middle" fontSize={11} className="fill-slate-500 dark:fill-zinc-400 font-medium">GDP Growth (%)</text>
            <text transform={`rotate(-90) translate(${-innerHeight / 2}, -${margin.left + 14})`} textAnchor="middle" fontSize={11} className="fill-slate-500 dark:fill-zinc-400 font-medium">Life Expectancy (years)</text>
          </Group>
        </svg>
        <div className="absolute bottom-2 right-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <span key={region} className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {region}
            </span>
          ))}
        </div>
        {tooltipOpen && tooltipData &&
          createPortal(
            <div
              className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 shadow-lg"
              style={{ position: "fixed", left: (tooltipLeft ?? 0) + 12, top: (tooltipTop ?? 0) + 12, zIndex: 1000, pointerEvents: "none" }}
            >
              <div className="text-slate-800 dark:text-zinc-100 font-semibold text-sm">{tooltipData.country}</div>
              <div className="text-slate-600 dark:text-zinc-400 text-xs mt-1 space-y-0.5">
                <div>GDP Growth: {tooltipData.gdp_growth?.toFixed(1)}%</div>
                <div>Life Expectancy: {tooltipData.life_expectancy?.toFixed(0)} yrs</div>
                <div>Poverty: {tooltipData.poverty != null ? `${tooltipData.poverty.toFixed(1)}%` : "—"}</div>
                <div>Region: {tooltipData.region}</div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
});

export function GapminderScatterChart(props: GapminderScatterChartProps) {
  if (!props.data.length) return null;
  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0 h-full">
      <div className="w-full min-w-0 overflow-hidden h-full" style={{ height: "100%" }}>
        <ParentSize debounceTime={120} initialSize={{ width: 800, height: 400 }}>
          {({ width, height }) =>
            width > 0 && height > 0 ? <InnerGapminderScatter {...props} width={width} height={height} /> : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

export interface LineSeriesPoint {
  year: number;
  value: number;
}

export interface LineSeries {
  countryCode: string;
  countryName: string;
  points: LineSeriesPoint[];
}

interface VisxLineChartProps {
  series: LineSeries[];
  title: string;
  valueFormat: (n: number) => string;
}

const DEFAULT_MARGIN = { top: 24, right: 24, bottom: 36, left: 56 };
const NARROW_MARGIN = { top: 20, right: 12, bottom: 28, left: 40 };
const NARROW_BREAKPOINT = 420;
const TITLE_AREA_HEIGHT = 40;
const LINE_COLORS = [
  "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#eab308", "#22c55e", "#3b82f6",
];

function getMargin(width: number) {
  return width >= NARROW_BREAKPOINT ? DEFAULT_MARGIN : NARROW_MARGIN;
}

const InnerLineChart = memo(function InnerLineChart({
  width,
  height,
  series,
  title,
  valueFormat,
}: VisxLineChartProps & { width: number; height: number }) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip<{ series: LineSeries; year: number; value: number }>();

  const margin = useMemo(() => getMargin(width), [width]);
  const chartHeight = height - TITLE_AREA_HEIGHT;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const validSeries = useMemo(() => series.filter((s) => s.points.length > 0), [series]);
  const allYears = useMemo(() => {
    const set = new Set<number>();
    validSeries.forEach((s) => s.points.forEach((p) => set.add(p.year)));
    return Array.from(set).sort((a, b) => a - b);
  }, [validSeries]);
  const allValues = useMemo(() => {
    const v: number[] = [];
    validSeries.forEach((s) => s.points.forEach((p) => v.push(p.value)));
    return v;
  }, [validSeries]);

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: allYears.length ? [Math.min(...allYears), Math.max(...allYears)] : [0, 1],
        range: [0, innerWidth],
        round: true,
      }),
    [allYears, innerWidth],
  );

  const yMin = allValues.length ? Math.min(...allValues) : 0;
  const yMax = allValues.length ? Math.max(...allValues) : 1;
  const yPad = (yMax - yMin) * 0.05 || 1;
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [yMin - yPad, yMax + yPad],
        range: [innerHeight, 0],
        round: true,
      }),
    [yMin, yMax, yPad, innerHeight],
  );

  const handleChartMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const ox = e.nativeEvent.offsetX;
      const oy = e.nativeEvent.offsetY;
      const year = xScale.invert(ox);
      const valueY = yScale.invert(oy);
      let best: { series: LineSeries; point: LineSeriesPoint; dist: number } | null = null;
      for (const s of validSeries) {
        const idx = s.points.findIndex((p) => p.year >= year);
        const prev = idx <= 0 ? s.points[0] : s.points[idx - 1];
        const next = idx < 0 ? s.points[s.points.length - 1] : s.points[idx] ?? prev;
        const pt = prev && next && Math.abs(prev.year - year) <= Math.abs(next.year - year) ? prev : next;
        if (!pt) continue;
        const dy = Math.abs(pt.value - valueY);
        const dist = Math.abs(pt.year - year) + dy * (innerWidth / innerHeight);
        if (!best || dist < best.dist) best = { series: s, point: pt, dist };
      }
      if (best) {
        setHoveredCode(best.series.countryCode);
        showTooltip({
          tooltipData: { series: best.series, year: best.point.year, value: best.point.value },
          tooltipLeft: e.clientX,
          tooltipTop: e.clientY,
        });
      }
    },
    [validSeries, xScale, yScale, innerWidth, innerHeight, showTooltip],
  );

  const handleChartMouseLeave = useCallback(() => {
    setHoveredCode(null);
    hideTooltip();
  }, [hideTooltip]);

  if (validSeries.length === 0 || width < 300 || chartHeight < 10) return null;

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <h2 className="chart-title mb-2 shrink-0" style={{ minHeight: TITLE_AREA_HEIGHT - 8 }}>
        {title}
      </h2>
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <svg width={width} height={chartHeight} className="block">
          <Group left={margin.left} top={margin.top}>
            {yScale.ticks(5).map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-slate-400 dark:text-zinc-500"
              />
            ))}
            {xScale.ticks(5).map((tick) => (
              <line
                key={tick}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-slate-400 dark:text-zinc-500"
              />
            ))}
            {validSeries.map((s, i) => {
              const color = LINE_COLORS[i % LINE_COLORS.length];
              const isHovered = hoveredCode === s.countryCode;
              const isDimmed = hoveredCode != null && !isHovered;
              const opacity = isDimmed ? 0.2 : 1;
              const strokeWidth = isHovered ? 2.5 : 1.5;
              return (
                <LinePath
                  key={s.countryCode}
                  data={s.points}
                  x={(p) => xScale(p.year)}
                  y={(p) => yScale(p.value)}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  curve={undefined}
                />
              );
            })}
            <rect
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
            />
            <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="currentColor" strokeOpacity={0.4} className="text-slate-400 dark:text-zinc-500" />
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="currentColor" strokeOpacity={0.4} className="text-slate-400 dark:text-zinc-500" />
            {xScale.ticks(5).map((tick) => (
              <text key={tick} x={xScale(tick)} y={innerHeight + 14} textAnchor="middle" fontSize={10} className="fill-slate-500 dark:fill-zinc-400">{tick}</text>
            ))}
            {yScale.ticks(5).map((tick) => (
              <text key={tick} x={-8} y={yScale(tick)} dy="0.35em" textAnchor="end" fontSize={10} className="fill-slate-500 dark:fill-zinc-400">{valueFormat(tick)}</text>
            ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData &&
          createPortal(
            <div
              className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 shadow-lg"
              style={{
                position: "fixed",
                left: (tooltipLeft ?? 0) + 12,
                top: (tooltipTop ?? 0) + 12,
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <div className="text-slate-800 dark:text-zinc-100 font-semibold text-sm">{tooltipData.series.countryName}</div>
              <div className="text-slate-600 dark:text-zinc-400 text-xs mt-0.5">{tooltipData.year}: {valueFormat(tooltipData.value)}</div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
});

const CHART_HEIGHT = 360;

export function VisxLineChart(props: VisxLineChartProps) {
  if (!props.series.length) return null;
  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0">
      <div className="w-full min-w-0 overflow-hidden" style={{ height: CHART_HEIGHT, minWidth: 0 }}>
        <ParentSize debounceTime={120} initialSize={{ width: 800, height: CHART_HEIGHT }}>
          {({ width, height }) =>
            width > 0 && height > 0 ? <InnerLineChart {...props} width={width} height={height} /> : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

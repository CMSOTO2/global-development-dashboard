"use client";

import { memo, useMemo, useState, useCallback, useRef } from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import {
  type LineSeries,
  type LineSeriesPoint,
  getMargin,
  TITLE_BLOCK_HEIGHT,
  LEGEND_HEIGHT,
  LINE_COLORS,
} from "./constants";
import { LineChartTooltip } from "./LineChartTooltip";
import { LineChartLegend } from "./LineChartLegend";
import type { VisxLineChartProps } from "./constants";

export const InnerLineChart = memo(function InnerLineChart({
  width,
  height,
  series,
  title,
  valueFormat,
}: VisxLineChartProps & { width: number; height: number }) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [pinnedCode, setPinnedCode] = useState<string | null>(null);
  const plotRectRef = useRef<SVGRectElement>(null);
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<{ series: LineSeries; year: number; value: number }>();

  const margin = useMemo(() => getMargin(width), [width]);
  const chartHeight = Math.max(
    120,
    height - TITLE_BLOCK_HEIGHT - LEGEND_HEIGHT,
  );
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const validSeries = useMemo(
    () => series.filter((s) => s.points.length > 0),
    [series],
  );
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
        domain: allYears.length
          ? [Math.min(...allYears), Math.max(...allYears)]
          : [0, 1],
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

  const visibleSeries = pinnedCode
    ? validSeries.filter((s) => s.countryCode === pinnedCode)
    : validSeries;

  const handleChartMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const rect = plotRectRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      let best: {
        series: LineSeries;
        point: LineSeriesPoint;
        dist: number;
      } | null = null;
      for (const s of visibleSeries) {
        for (const pt of s.points) {
          const sx = xScale(pt.year);
          const sy = yScale(pt.value);
          const dist = Math.hypot(ox - sx, oy - sy);
          if (!best || dist < best.dist) best = { series: s, point: pt, dist };
        }
      }
      if (best) {
        setHoveredCode(best.series.countryCode);
        showTooltip({
          tooltipData: {
            series: best.series,
            year: best.point.year,
            value: best.point.value,
          },
          tooltipLeft: e.clientX,
          tooltipTop: e.clientY,
        });
      }
    },
    [visibleSeries, xScale, yScale, showTooltip],
  );

  const handleChartMouseLeave = useCallback(() => {
    setHoveredCode(null);
    hideTooltip();
  }, [hideTooltip]);

  const findNearestSeries = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const rect = plotRectRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      let best: { series: LineSeries; dist: number } | null = null;
      for (const s of visibleSeries) {
        for (const pt of s.points) {
          const sx = xScale(pt.year);
          const sy = yScale(pt.value);
          const dist = Math.hypot(ox - sx, oy - sy);
          if (!best || dist < best.dist) best = { series: s, dist };
        }
      }
      return best?.series ?? null;
    },
    [visibleSeries, xScale, yScale],
  );

  const handleChartClick = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (pinnedCode) {
        setPinnedCode(null);
        return;
      }
      const nearest = findNearestSeries(e);
      if (nearest) setPinnedCode(nearest.countryCode);
    },
    [pinnedCode, findNearestSeries],
  );

  const pinnedSeries = pinnedCode
    ? validSeries.find((s) => s.countryCode === pinnedCode)
    : null;

  if (validSeries.length === 0 || width < 300 || chartHeight < 10) return null;

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <div
        className="shrink-0 overflow-hidden"
        style={{ height: TITLE_BLOCK_HEIGHT }}
      >
        <h2 className="chart-title truncate">{title}</h2>
        <p
          className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5"
          style={{ visibility: pinnedSeries ? "visible" : "hidden" }}
        >
          {pinnedSeries
            ? `Showing only ${pinnedSeries.countryName} — click chart to show all lines`
            : ""}
        </p>
      </div>
      <div className="relative shrink-0" style={{ height: chartHeight }}>
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
            {visibleSeries.map((s, i) => {
              const colorIndex = validSeries.findIndex(
                (vs) => vs.countryCode === s.countryCode,
              );
              const color =
                LINE_COLORS[
                  (colorIndex >= 0 ? colorIndex : i) % LINE_COLORS.length
                ];
              const isHovered = hoveredCode === s.countryCode;
              const isDimmed =
                !pinnedCode && hoveredCode != null && !isHovered;
              const opacity = isDimmed ? 0.2 : 1;
              const strokeWidth = isHovered || pinnedCode ? 2.5 : 1.5;
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
              ref={plotRectRef}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={handleChartMouseLeave}
              onClick={handleChartClick}
            />
            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="currentColor"
              strokeOpacity={0.4}
              className="text-slate-400 dark:text-zinc-500"
            />
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={innerHeight}
              stroke="currentColor"
              strokeOpacity={0.4}
              className="text-slate-400 dark:text-zinc-500"
            />
            {xScale.ticks(5).map((tick) => (
              <text
                key={tick}
                x={xScale(tick)}
                y={innerHeight + 14}
                textAnchor="middle"
                fontSize={10}
                className="fill-slate-500 dark:fill-zinc-400"
              >
                {tick}
              </text>
            ))}
            {yScale.ticks(5).map((tick) => (
              <text
                key={tick}
                x={-8}
                y={yScale(tick)}
                dy="0.35em"
                textAnchor="end"
                fontSize={10}
                className="fill-slate-500 dark:fill-zinc-400"
              >
                {valueFormat(tick)}
              </text>
            ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && (
          <LineChartTooltip
            tooltipData={tooltipData}
            tooltipLeft={tooltipLeft}
            tooltipTop={tooltipTop}
            valueFormat={valueFormat}
          />
        )}
      </div>
      <LineChartLegend
        visibleSeries={visibleSeries}
        validSeries={validSeries}
        hoveredCode={hoveredCode}
        pinnedCode={pinnedCode}
      />
    </div>
  );
});

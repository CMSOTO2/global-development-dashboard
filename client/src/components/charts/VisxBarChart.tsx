import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { BarRounded } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

export interface BarDatum {
  label: string;
  value: number;
}

interface VisxBarChartProps {
  data: BarDatum[];
  title: string;
  valueFormat?: (n: number) => string;
  color: string;
  maxBars?: number;
}

const defaultFormat = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const DEFAULT_MARGIN = { top: 24, right: 24, bottom: 36, left: 56 };
const NARROW_MARGIN = { top: 20, right: 12, bottom: 28, left: 36 };
const NARROW_BREAKPOINT = 420;
/** Reserved height for title + margin so SVG height = ParentSize height - this (avoids resize loop). */
const TITLE_AREA_HEIGHT = 40;

function getMargin(width: number) {
  return width >= NARROW_BREAKPOINT ? DEFAULT_MARGIN : NARROW_MARGIN;
}

const InnerBarChart = memo(function InnerBarChart({
  width,
  height,
  data,
  title,
  valueFormat = defaultFormat,
  color,
  maxBars,
}: VisxBarChartProps & { width: number; height: number }) {
  const sorted = useMemo(() => {
    const filtered = [...data]
      .filter((d) => Number.isFinite(d.value))
      .sort((a, b) => b.value - a.value);
    return maxBars != null ? filtered.slice(0, maxBars) : filtered;
  }, [data, maxBars]);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<BarDatum>();

  const margin = useMemo(() => getMargin(width), [width]);
  const chartHeight = height - TITLE_AREA_HEIGHT;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xMax = Math.max(0, ...sorted.map((d) => d.value));
  const xMin = Math.min(0, ...sorted.map((d) => d.value));

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [xMin, xMax],
        range: [0, innerWidth],
        round: true,
      }),
    [xMin, xMax, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: sorted.map((d) => d.label),
        range: [0, innerHeight],
        padding: 0.32,
        round: true,
      }),
    [sorted, innerHeight],
  );

  if (sorted.length === 0 || width < 300 || chartHeight < 10) return null;

  const barRadius = 4;

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <h2
        className="chart-title mb-2 shrink-0"
        style={{ minHeight: TITLE_AREA_HEIGHT - 8 }}
      >
        {title}
      </h2>
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <svg
          width={width}
          height={chartHeight}
          preserveAspectRatio="xMidYMid meet"
          className="block"
        >
          <Group left={margin.left} top={margin.top}>
            {/* Grid lines */}
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
            {/* Bars */}
            {sorted.map((d) => {
              const barWidth = Math.abs(xScale(d.value) - xScale(0));
              const barX = d.value >= 0 ? xScale(0) : xScale(d.value);
              const barY = yScale(d.label) ?? 0;
              const barHeight = yScale.bandwidth();
              return (
                <Group key={d.label}>
                  <BarRounded
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    radius={barRadius}
                    right={d.value >= 0}
                    left={d.value < 0}
                    fill={color}
                    fillOpacity={0.92}
                    onMouseEnter={(e) => {
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: e.clientX,
                        tooltipTop: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: e.clientX,
                        tooltipTop: e.clientY,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                    style={{ cursor: "pointer" }}
                  />
                  {/* Value label at end of bar */}
                  <text
                    x={d.value >= 0 ? barX + barWidth + 6 : barX - 6}
                    y={barY + barHeight / 2}
                    dy="0.35em"
                    textAnchor={d.value >= 0 ? "start" : "end"}
                    fontSize={width >= NARROW_BREAKPOINT ? 11 : 9}
                    className="fill-slate-600 dark:fill-zinc-300 font-medium"
                  >
                    {valueFormat(d.value)}
                  </text>
                </Group>
              );
            })}
            {/* Axes */}
            <AxisLeft
              scale={yScale}
              tickStroke="currentColor"
              stroke="currentColor"
              tickLabelProps={() => ({
                fill: "currentColor",
                fontSize: width >= NARROW_BREAKPOINT ? 11 : 9,
                textAnchor: "end",
                dx: -6,
                className: "fill-slate-600 dark:fill-zinc-400",
              })}
              axisClassName="text-slate-400 dark:text-zinc-500"
              hideZero
            />
            <AxisBottom
              top={innerHeight}
              scale={xScale}
              tickFormat={(v) => valueFormat(Number(v))}
              tickStroke="currentColor"
              stroke="currentColor"
              tickLabelProps={() => ({
                fill: "currentColor",
                fontSize: width >= NARROW_BREAKPOINT ? 10 : 9,
                textAnchor: "middle",
                className: "fill-slate-500 dark:fill-zinc-400",
              })}
              axisClassName="text-slate-400 dark:text-zinc-500"
              numTicks={5}
            />
          </Group>
        </svg>
        {tooltipOpen &&
          tooltipData &&
          createPortal(
            <div
              className="chart-tooltip rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 px-3 py-2 shadow-lg"
              style={{
                position: "fixed",
                left: (tooltipLeft ?? 0) + 12,
                top: (tooltipTop ?? 0) + 12,
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <div className="text-slate-800 dark:text-zinc-100 font-semibold text-sm">
                {tooltipData.label}
              </div>
              <div className="text-slate-600 dark:text-zinc-400 text-xs mt-0.5">
                {valueFormat(tooltipData.value)}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
});

const BAR_CHART_HEIGHT = 280;
const MIN_BAR_HEIGHT = 14;
const SCROLLABLE_MAX_HEIGHT_PX = 600;

export function VisxBarChart(props: VisxBarChartProps) {
  if (!props.data.length) return null;
  const n = props.data.length;
  const dynamicHeight =
    TITLE_AREA_HEIGHT +
    DEFAULT_MARGIN.top +
    DEFAULT_MARGIN.bottom +
    n * MIN_BAR_HEIGHT;
  const innerHeight = Math.max(
    BAR_CHART_HEIGHT,
    Math.min(SCROLLABLE_MAX_HEIGHT_PX, dynamicHeight),
  );
  const isScrollable = dynamicHeight > SCROLLABLE_MAX_HEIGHT_PX;

  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0">
      <div
        className="w-full min-w-0 overflow-x-hidden"
        style={{
          height: isScrollable ? SCROLLABLE_MAX_HEIGHT_PX : innerHeight,
          minWidth: 0,
          overflowY: isScrollable ? "auto" : "hidden",
        }}
      >
        <div style={{ height: innerHeight, minWidth: 0 }}>
          <ParentSize
            debounceTime={120}
            initialSize={{ width: 600, height: innerHeight }}
          >
            {({ width, height }) =>
              width > 0 && height > 0 ? (
                <InnerBarChart {...props} width={width} height={height} />
              ) : null
            }
          </ParentSize>
        </div>
      </div>
    </div>
  );
}

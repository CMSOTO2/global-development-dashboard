import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";

export interface ScatterDatum {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface VisxScatterChartProps {
  data: ScatterDatum[];
  title: string;
  xLabel: string;
  yLabel: string;
  xFormat?: (n: number) => string;
  yFormat?: (n: number) => string;
}

const defaultFormat = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const DEFAULT_MARGIN = { top: 32, right: 24, bottom: 44, left: 52 };
const NARROW_MARGIN = { top: 24, right: 12, bottom: 36, left: 40 };
const NARROW_BREAKPOINT = 420;
/** Reserved height for title + margin so SVG height = ParentSize height - this (avoids resize loop). */
const TITLE_AREA_HEIGHT = 40;

function getMargin(width: number) {
  return width >= NARROW_BREAKPOINT ? DEFAULT_MARGIN : NARROW_MARGIN;
}

const InnerScatterChart = memo(function InnerScatterChart({
  width,
  height,
  data,
  title,
  xLabel,
  yLabel,
  xFormat = defaultFormat,
  yFormat = defaultFormat,
}: VisxScatterChartProps & { width: number; height: number }) {
  const valid = useMemo(
    () => data.filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y)),
    [data],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ScatterDatum>();

  const margin = useMemo(() => getMargin(width), [width]);
  const chartHeight = height - TITLE_AREA_HEIGHT;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xExtent = useMemo(() => {
    const xs = valid.map((d) => d.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const pad = lo === hi ? 1 : 0;
    return [lo - pad, hi + pad] as [number, number];
  }, [valid]);

  const yExtent = useMemo(() => {
    const ys = valid.map((d) => d.y);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = lo === hi ? 1 : 0;
    return [lo - pad, hi + pad] as [number, number];
  }, [valid]);

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: xExtent,
        range: [0, innerWidth],
        round: true,
      }),
    [xExtent, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: yExtent,
        range: [innerHeight, 0],
        round: true,
      }),
    [yExtent, innerHeight],
  );

  if (valid.length === 0 || width < 300 || chartHeight < 10) return null;

  const radius = width >= NARROW_BREAKPOINT ? 6 : 4;
  const tickFontSize = width >= NARROW_BREAKPOINT ? 10 : 9;
  const axisLabelFontSize = width >= NARROW_BREAKPOINT ? 11 : 10;

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
            {/* Grid */}
            {xScale.ticks(5).map((tick) => (
              <line
                key={`v-${tick}`}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-slate-400 dark:text-zinc-500"
              />
            ))}
            {yScale.ticks(5).map((tick) => (
              <line
                key={`h-${tick}`}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-slate-400 dark:text-zinc-500"
              />
            ))}
            {/* Points */}
            {valid.map((d) => (
              <circle
                key={d.id}
                cx={xScale(d.x)}
                cy={yScale(d.y)}
                r={radius}
                fill="#0ea5e9"
                fillOpacity={0.88}
                stroke="white"
                strokeWidth={2}
                className="dark:stroke-zinc-800"
                style={{ cursor: "pointer" }}
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
              />
            ))}
            {/* X axis line */}
            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="currentColor"
              strokeOpacity={0.4}
              className="text-slate-400 dark:text-zinc-500"
            />
            {/* Y axis line */}
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={innerHeight}
              stroke="currentColor"
              strokeOpacity={0.4}
              className="text-slate-400 dark:text-zinc-500"
            />
            {/* Axis labels */}
            {xScale.ticks(5).map((tick) => (
              <text
                key={tick}
                x={xScale(tick)}
                y={innerHeight + 14}
                textAnchor="middle"
                fontSize={tickFontSize}
                className="fill-slate-500 dark:fill-zinc-400"
              >
                {xFormat(tick)}
              </text>
            ))}
            {yScale.ticks(5).map((tick) => (
              <text
                key={tick}
                x={-8}
                y={yScale(tick)}
                dy="0.35em"
                textAnchor="end"
                fontSize={tickFontSize}
                className="fill-slate-500 dark:fill-zinc-400"
              >
                {yFormat(tick)}
              </text>
            ))}
            <text
              x={innerWidth / 2}
              y={innerHeight + 34}
              textAnchor="middle"
              fontSize={axisLabelFontSize}
              className="fill-slate-500 dark:fill-zinc-400 font-medium"
            >
              {xLabel}
            </text>
            <text
              transform={`rotate(-90) translate(${-innerHeight / 2}, -${margin.left + 14})`}
              textAnchor="middle"
              fontSize={axisLabelFontSize}
              className="fill-slate-500 dark:fill-zinc-400 font-medium"
            >
              {yLabel}
            </text>
          </Group>
        </svg>
        {tooltipOpen &&
          tooltipData &&
          createPortal(
            <div
              className="chart-tooltip rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 shadow-lg"
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
              <div className="text-slate-600 dark:text-zinc-400 text-xs mt-1 space-y-0.5">
                <div>
                  {xLabel}: {xFormat(tooltipData.x)}
                </div>
                <div>
                  {yLabel}: {yFormat(tooltipData.y)}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
});

const SCATTER_CHART_HEIGHT = 320;

export function VisxScatterChart(props: VisxScatterChartProps) {
  if (!props.data.length) return null;
  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0">
      <div
        className="w-full min-w-0 overflow-hidden"
        style={{ height: SCATTER_CHART_HEIGHT, minWidth: 0 }}
      >
        <ParentSize
          debounceTime={120}
          initialSize={{ width: 800, height: SCATTER_CHART_HEIGHT }}
        >
          {({ width, height }) =>
            width > 0 && height > 0 ? (
              <InnerScatterChart {...props} width={width} height={height} />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

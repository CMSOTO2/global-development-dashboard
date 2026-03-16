"use client";

import { ParentSize } from "@visx/responsive";
import type { VisxLineChartProps } from "./constants";
import { InnerLineChart } from "./InnerLineChart";

export type { LineSeriesPoint, LineSeries } from "./constants";
export type { VisxLineChartProps } from "./constants";

export function VisxLineChart(props: VisxLineChartProps) {
  if (!props.series.length) return null;
  return (
    <div className="chart-card flex flex-col overflow-hidden min-w-0 h-full">
      <div
        className="w-full min-w-0 overflow-hidden h-full"
        style={{ height: "100%" }}
      >
        <ParentSize
          debounceTime={120}
          initialSize={{ width: 800, height: 400 }}
        >
          {({ width, height }) =>
            width > 0 && height > 0 ? (
              <InnerLineChart {...props} width={width} height={height} />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
}

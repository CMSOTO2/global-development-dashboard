import { createPortal } from "react-dom";
import type { LineSeries } from "./constants";

export interface LineChartTooltipData {
  series: LineSeries;
  year: number;
  value: number;
}

interface LineChartTooltipProps {
  tooltipData: LineChartTooltipData | null;
  tooltipLeft: number | undefined;
  tooltipTop: number | undefined;
  valueFormat: (n: number) => string;
}

export function LineChartTooltip({
  tooltipData,
  tooltipLeft,
  tooltipTop,
  valueFormat,
}: LineChartTooltipProps) {
  if (!tooltipData) return null;
  return createPortal(
    <div
      className="rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 px-3 py-2 shadow-lg"
      style={{
        position: "fixed",
        left: (tooltipLeft ?? 0) + 12,
        top: (tooltipTop ?? 0) + 12,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div className="text-slate-800 dark:text-zinc-100 font-semibold text-sm">
        {tooltipData.series.countryName}
      </div>
      <div className="text-slate-600 dark:text-zinc-400 text-xs mt-0.5">
        {tooltipData.year}: {valueFormat(tooltipData.value)}
      </div>
    </div>,
    document.body,
  );
}

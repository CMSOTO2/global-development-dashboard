import type { LineSeries } from "./constants";
import { LINE_COLORS, LEGEND_HEIGHT } from "./constants";

interface LineChartLegendProps {
  visibleSeries: LineSeries[];
  validSeries: LineSeries[];
  hoveredCode: string | null;
  pinnedCode: string | null;
}

export function LineChartLegend({
  visibleSeries,
  validSeries,
  hoveredCode,
  pinnedCode,
}: LineChartLegendProps) {
  return (
    <div
      className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 pt-2 border-t border-slate-100 dark:border-zinc-800"
      style={{ minHeight: LEGEND_HEIGHT }}
    >
      {visibleSeries.map((s, i) => {
        const colorIndex = validSeries.findIndex(
          (vs) => vs.countryCode === s.countryCode,
        );
        const color =
          LINE_COLORS[(colorIndex >= 0 ? colorIndex : i) % LINE_COLORS.length];
        const isDimmed =
          !pinnedCode && hoveredCode != null && hoveredCode !== s.countryCode;
        return (
          <span
            key={s.countryCode}
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ opacity: isDimmed ? 0.4 : 1 }}
          >
            <span
              className="inline-block w-4 h-0.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-slate-600 dark:text-zinc-400 truncate max-w-[120px]">
              {s.countryName}
            </span>
          </span>
        );
      })}
    </div>
  );
}

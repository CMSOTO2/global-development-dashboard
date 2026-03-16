import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardControls } from "./DashboardControls";
import { BubbleChartFilters } from "./BubbleChartFilters";
import { VisxLineChart } from "./charts/VisxLineChart";
import { GapminderScatterChart } from "./charts/GapminderScatterChart";
import { GeoMercatorChart } from "./charts/GeoMercatorChart";
import {
  BubbleChartSkeleton,
  ChartSkeleton,
  ControlsSkeleton,
} from "./skeletons";
import { DashboardIntro } from "./DashboardIntro";

export function GlobalDevelopmentDashboard() {
  const {
    metric,
    setMetric,
    regionFilter,
    setRegionFilter,
    incomeFilter,
    setIncomeFilter,
    selectedCountryCodes,
    addCountry,
    removeCountry,
    regions,
    incomes,
    countryOptions,
    lineChartSeries,
    scatterData,
    historyData,
    metricConfig,
    isLoading,
    error,
  } = useDashboardData();

  if (error)
    return (
      <div className="p-8 text-red-600 dark:text-red-400">
        Error: {(error as Error).message}
      </div>
    );

  return (
    <div className="min-w-0">
      <div className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8 min-w-0">
        <DashboardIntro isLoading={isLoading} />

        {isLoading ? (
          <ControlsSkeleton />
        ) : (
          <DashboardControls
            metric={metric}
            onMetricChange={setMetric}
            regionFilter={regionFilter}
            onRegionFilterChange={setRegionFilter}
            incomeFilter={incomeFilter}
            onIncomeFilterChange={setIncomeFilter}
            selectedCountryCodes={selectedCountryCodes}
            onAddCountry={addCountry}
            onRemoveCountry={removeCountry}
            regions={regions}
            incomes={incomes}
            countryOptions={countryOptions}
          />
        )}

        {isLoading ? (
          <ChartSkeleton height="80vh" className="mb-6" />
        ) : (
          <section className="min-w-0 mb-6" style={{ height: "80vh" }}>
            <VisxLineChart
              series={lineChartSeries}
              title={`${metricConfig.label} Over Time`}
              valueFormat={metricConfig.format}
            />
          </section>
        )}

        {isLoading ? (
          <BubbleChartSkeleton height="80vh" />
        ) : (
          <>
            <BubbleChartFilters
              regionFilter={regionFilter}
              onRegionFilterChange={setRegionFilter}
              incomeFilter={incomeFilter}
              onIncomeFilterChange={setIncomeFilter}
              regions={regions}
              incomes={incomes}
              countryCount={scatterData.length}
            />
            <section className="min-w-0 mb-6" style={{ height: "80vh" }}>
              <GapminderScatterChart data={scatterData} />
            </section>
          </>
        )}

        {!isLoading && (
          <section className="min-w-0 mb-6" style={{ height: "80vh" }}>
            <GeoMercatorChart historyData={historyData} />
          </section>
        )}
      </div>
    </div>
  );
}

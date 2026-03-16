import { useEconomicHistoryQuery } from "../queries/useEconomicHistoryQuery";
export const EconomicHistory = () => {
  const { data, isLoading, error } = useEconomicHistoryQuery();

  if (isLoading)
    return (
      <div className="p-4 text-slate-600 dark:text-zinc-400">Loading...</div>
    );
  if (error)
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Error: {error.message}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">
        Economic History
      </h1>
      <ul className="space-y-1 text-slate-700 dark:text-zinc-300 text-sm">
        {data?.map((item) => (
          <li key={item.country_code} className="py-1">
            {item.country_code} — {item.country} · {item.region} · {item.income}
          </li>
        ))}
      </ul>
    </div>
  );
};

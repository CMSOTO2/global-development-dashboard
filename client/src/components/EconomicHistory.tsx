import { useEconomicHistoryQuery } from "../queries/useEconomicHistoryQuery";
export const EconomicHistory = () => {
  const { data, isLoading, error } = useEconomicHistoryQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Economic History</h1>
      <ul>
        {data?.map((item) => (
          <li key={item.country_code}>
            {item.country_code} - {item.country} - {item.region} - {item.income}
          </li>
        ))}
      </ul>
    </div>
  );
};

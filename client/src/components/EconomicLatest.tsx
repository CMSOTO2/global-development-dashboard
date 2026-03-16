import { useEconomicLatestQuery } from "../queries/useEconomicLatestQuery";

export const EconomicLatest = () => {
  const { data, isLoading, error } = useEconomicLatestQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Economic Latest</h1>
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

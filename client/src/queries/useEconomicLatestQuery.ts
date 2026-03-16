import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../config";
import type { EconomicLatest } from "../../../shared/types";

export const useEconomicLatestQuery = () => {
  return useQuery<EconomicLatest[]>({
    queryKey: ["economic-latest"],
    queryFn: () =>
      fetch(`${API_BASE_URL}/analytics/economic-latest`).then((res) =>
        res.json(),
      ),
  });
};

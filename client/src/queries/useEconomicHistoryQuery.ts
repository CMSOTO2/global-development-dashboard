import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../config";
import type { EconomicHistory } from "../../../shared/types";

export const useEconomicHistoryQuery = () => {
  return useQuery<EconomicHistory[]>({
    queryKey: ["economic-history"],
    queryFn: () =>
      fetch(`${API_BASE_URL}/analytics/economic-history`).then((res) =>
        res.json(),
      ),
  });
};

import { useQuery } from "@tanstack/react-query";
import type * as topojson from "topojson-client";

const WORLD_TOPOLOGY_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const useWorldTopologyQuery = () => {
  return useQuery<topojson.Topology>({
    queryKey: ["world-topology"],
    queryFn: () => fetch(WORLD_TOPOLOGY_URL).then((res) => res.json()),
    staleTime: Number.POSITIVE_INFINITY,
  });
};

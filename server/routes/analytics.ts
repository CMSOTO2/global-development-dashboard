import { FastifyInstance } from "fastify";
import { EconomicHistory, EconomicHistoryData } from "../../shared/types";

type EconomicHistoryRow = Omit<EconomicHistory, "data"> & {
  data: string;
};

export async function analyticsRoutes(server: FastifyInstance) {
  server.get("/economic-history", async (_request, reply) => {
    try {
      // Group in SQL with JSON aggregates — one row per country, much faster than fetching all rows and grouping in JS

      const rows = (await server.db.query(`
        SELECT
          country,
          country_code,
          region,
          income,
          json_group_array(
            json_object(
              'year', year,
              'gdp_growth', gdp_growth,
              'inflation', inflation,
              'life_expectancy', life_expectancy,
              'poverty', poverty
            )
          ) AS data
        FROM (
          SELECT
            country_code,
            year,
            MAX(country) AS country,
            MAX(region) AS region,
            MAX(income) AS income,
            MAX(gdp_growth) AS gdp_growth,
            MAX(inflation) AS inflation,
            MAX(life_expectancy) AS life_expectancy,
            MAX(poverty) AS poverty
          FROM economic_history
          GROUP BY country_code, year
          ORDER BY country_code, year
        )
        GROUP BY country_code
      `)) as EconomicHistoryRow[];

      const economicHistoryData: EconomicHistory[] = rows.map((row) => ({
        country: row.country,
        country_code: row.country_code,
        region: row.region,
        income: row.income,
        data: JSON.parse(row.data) as EconomicHistoryData[],
      }));

      return reply.status(200).send(economicHistoryData);
    } catch (error) {
      server.log.error(error);
      return reply
        .status(500)
        .send({ error: "Failed to get economic history data" });
    }
  });

  server.get("/economic-latest", async (_request, reply) => {
    try {
      const economicLatestData = await server.db.query(
        "SELECT * FROM economic_latest",
      );
      return reply.status(200).send(economicLatestData);
    } catch (error) {
      server.log.error(error);
      return reply
        .status(500)
        .send({ error: "Failed to get economic latest data" });
    }
  });
}

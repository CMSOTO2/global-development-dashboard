import { FastifyInstance } from "fastify";

export async function analyticsRoutes(server: FastifyInstance) {
  server.get("/gdp", async () => {
    return { hello: "world" };
  });
}

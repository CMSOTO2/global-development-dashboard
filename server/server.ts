import Fastify from "fastify";
import { analyticsRoutes } from "./routes/analytics";

const server = Fastify({
  logger: true,
});

async function buildServer() {
  server.register(analyticsRoutes, { prefix: "/analytics" });

  try {
    await server.listen({ port: 3000 });
    console.log(`Server running on http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

buildServer();

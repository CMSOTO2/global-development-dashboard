import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { analyticsRoutes } from "./routes/analytics";
import cors from "@fastify/cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = Fastify({
  logger: true,
});

const dbPath = path.join(__dirname, "..", "db", "dev.sqlite");
const db = new Database(dbPath);

// Index for fast grouping/sorting on economic-history endpoint
try {
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_economic_history_country_year ON economic_history(country_code, year)",
  );
} catch {
  // Ignore if table doesn't exist yet
}

const dbWrapper = {
  query(sql: string, params: unknown[] = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
};

declare module "fastify" {
  interface FastifyInstance {
    db: typeof dbWrapper;
  }
}

async function buildServer() {
  server.decorate("db", dbWrapper);

  server.register(analyticsRoutes, { prefix: "/analytics" });
  server.register(cors, {
    origin: "http://localhost:3000",
    credentials: true,
  });

  server.addHook("onClose", (instance, done) => {
    db.close();
    done();
  });

  try {
    await server.listen({ port: 3000 });
    console.log(`Server running on http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

buildServer();

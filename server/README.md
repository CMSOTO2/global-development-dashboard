# Global Development Dashboard – Server

Backend for the global development dashboard. Serves analytics data from SQLite and, in production, the built client.

## Tech

- **Runtime:** Node.js with **tsx** for TypeScript execution (no separate compile step in dev).
- **Framework:** **Fastify** (v5) with logging, CORS, and static file serving.
- **Database:** **better-sqlite3**; database file lives at `../db/dev.sqlite` (see repo root `db/schema.sql` for tables).
- **API:** REST over HTTP. Routes are registered under the `/analytics` prefix.

## What was done

- **Fastify app** in `server.ts`: creates the server, opens the SQLite DB, and applies an index on `economic_history(country_code, year)` for faster grouping. A small `db` wrapper (prepare + `stmt.all`) is attached via `server.decorate("db", dbWrapper)` so routes use `server.db.query(sql, params)`.
- **CORS** is configured for `http://localhost:5173`, `http://localhost:3000`, and the production Railway URL; credentials are allowed.
- **Analytics routes** in `routes/analytics.ts`:
  - `GET /analytics/economic-history` – Returns one record per country with a `data` array of yearly points (year, gdp_growth, inflation, life_expectancy, poverty, population, population_growth). Implemented with a single SQL query that uses `json_group_array` and `json_object` so grouping happens in the DB.
  - `GET /analytics/economic-latest` – Returns all rows from `economic_latest` (latest snapshot per country).
- **Static and SPA fallback:** The built client in `../client/dist` is served via `@fastify/static`. A `setNotFoundHandler` sends `index.html` for non-file requests so client-side routing works.
- **Port and host:** Server listens on `PORT` from the environment, or 3000. When `PORT` is set (e.g. on Railway), it binds to `0.0.0.0`; otherwise `localhost`.

## Scripts

- `npm run dev` / `npm start` – Run the server with `tsx server.ts`.

## Environment

- `PORT` – Optional. Port to listen on; when set, host is `0.0.0.0`.

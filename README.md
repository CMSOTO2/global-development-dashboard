# Global Development Dashboard

A full-stack data analytics platform for exploring global development indicators: GDP growth, inflation, life expectancy, poverty, and population. Raw economic data is processed in a data-science pipeline, stored in SQLite, and served via a REST API; a React dashboard consumes the API and visualizes the data with interactive charts and a world map.

---

## Purpose

This project turns raw economic datasets into an explorable dashboard so users can compare countries and regions and inspect trends over time. It demonstrates an end-to-end data product: data processing, backend API, and frontend visualization in a single repo.

---

## Tech Stack (high level)

- **Client:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, and Visx (plus topojson/d3-geo for the map). The UI is a SPA that talks to the analytics API and renders line charts, bar chart, scatter chart, and a geo Mercator map.
- **Server:** Node.js, Fastify, and better-sqlite3. The API serves economic history (per-country time series) and latest snapshots from SQLite; in production the same server also serves the built client.
- **Data:** SQLite database (schema and dev DB under `db/`). A Python/Jupyter pipeline in `data/notebooks/` cleans and prepares data before it is loaded into the DB.
- **Shared:** TypeScript types in `shared/` are used by both client and server for API contracts.

For per-package details, setup, and scripts:

- [client/README.md](client/README.md) — frontend stack, structure, and scripts
- [server/README.md](server/README.md) — backend stack, routes, and environment

---

## Project structure

```
global-development-dashboard/
├── client/          # React dashboard (see client/README.md)
├── server/          # Fastify API + static serve (see server/README.md)
├── db/              # SQLite schema and dev database
├── data/            # Raw data and notebooks (cleaning pipeline)
├── shared/          # Shared TypeScript types
└── README.md
```

---

## Running the project

1. **Database:** Ensure `db/dev.sqlite` exists and matches `db/schema.sql` (run migrations or load data as needed).
2. **Server:** From `server/`, run `npm install` and `npm run dev`. API and (if built) client are served at `http://localhost:3000`.
3. **Client (dev):** From `client/`, run `npm install` and `npm run dev`. Set `VITE_API_BASE_URL=http://localhost:3000` if the API runs on port 3000. Build with `npm run build`; the output in `client/dist/` is what the server serves in production.

See [client/README.md](client/README.md) and [server/README.md](server/README.md) for exact scripts and environment variables.

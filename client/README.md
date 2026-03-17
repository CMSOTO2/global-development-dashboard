# Global Development Dashboard – Client

Frontend for the global development dashboard. A React SPA that fetches economic data from the server and visualizes it with charts and a map.

## Tech

- **Build:** **Vite** (v7) with **@vitejs/plugin-react**. TypeScript is compiled by Vite; the app uses ESM and `import.meta.env` for config.
- **UI:** **React** 18 with **TypeScript**. Styling with **Tailwind CSS** (v4, via `@tailwindcss/vite`).
- **Data:** **TanStack Query (React Query)** for fetching and caching server data. API base URL is driven by `VITE_API_BASE_URL` (see below).
- **Charts and map:** **Visx** (axis, geo, scale, shape, tooltip, responsive) for line charts, bar chart, scatter (Gapminder-style) and a geo Mercator map; **topojson-client** and **d3-geo** for world topology and projection. Shared types for economic data live in the repo `shared/types` and are used by both client and server.

## What was done

- **App shell:** `main.tsx` mounts the app; `App.tsx` composes the dashboard. A theme context and toggle support light/dark UI.
- **Data layer:** Queries in `src/queries/` call the analytics API: `useEconomicHistoryQuery` for `/analytics/economic-history` and `useEconomicLatestQuery` for `/analytics/economic-latest`. `useDashboardData` and `useWorldTopologyQuery` coordinate data and topology for the dashboard and map.
- **Dashboard:** `GlobalDevelopmentDashboard` wires controls and charts. `DashboardControls` (filters, metric pills, country combobox) and `NarrowByFilters` / `BubbleChartFilters` let users filter by region, income, and metrics. Metric definitions live in `constants/metrics.ts` (aligned with `shared` types).
- **Charts:** Visx-based line chart (with legend and tooltip), bar chart, scatter (Gapminder-style), and `GeoMercatorChart` for the world map. Skeletons are used while data or topology are loading.
- **Config:** `config.ts` sets `API_BASE_URL` from `import.meta.env.VITE_API_BASE_URL`; leave it unset for same-origin (production behind the same server), or set it to `http://localhost:3000` when running the Vite dev server against the local API.

## Scripts

- `npm run dev` – Start Vite dev server (default port 5173).
- `npm run build` – Run `tsc -b` and `vite build`; output is `dist/` for the server to serve.
- `npm run preview` – Serve the production build locally.
- `npm run lint` – Run ESLint.

## Environment

- `VITE_API_BASE_URL` – Optional. Base URL for the analytics API. Omit when the client is served from the same origin as the API; set to `http://localhost:3000` when using the Vite dev server with the backend on port 3000.

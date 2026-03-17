/** Same-origin when empty (production); set VITE_API_BASE_URL=http://localhost:3000 for Vite dev server. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

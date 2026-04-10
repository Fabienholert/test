/** API utilisée par le front : en dev, backend local ; en prod, Render si VITE_API_URL est absent. */
const DEV_FALLBACK = "http://localhost:5001/api";
const PROD_FALLBACK = "https://audit-garantie-vw-api.onrender.com/api";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? DEV_FALLBACK : PROD_FALLBACK);

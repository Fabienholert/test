const DEV_FALLBACK = "http://localhost:5001/api";

/**
 * Dev : VITE_API_URL ou backend local.
 * Prod : toujours `/api` (proxy Netlify → Render, voir netlify.toml). Pas d’appel cross-origin depuis le navigateur.
 */
export const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || DEV_FALLBACK
  : "/api";

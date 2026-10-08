/**
 * API configuration and routing utility.
 * Supports configurable ML API base URL via VITE_ML_API_URL.
 * 
 * In production:
 *   Points to the separately hosted FastAPI service (e.g. Render, Railway, Cloud Run).
 * In local development:
 *   Defaults to empty string (using Vite dev proxy) or http://localhost:5001.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_ML_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  // Default to relative path for local dev proxy
  return "";
};

export const getApiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};

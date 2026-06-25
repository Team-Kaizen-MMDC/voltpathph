import dotenv from "dotenv";

// Load apps/api/.env into process.env (no-op in production where vars are
// injected by the platform). This is the ONLY place dotenv is loaded.
dotenv.config();

/**
 * Centralized, documented configuration for the Voltpath PH API.
 *
 * Every environment-specific value and tunable lives here, sourced from
 * environment variables (see `apps/api/.env.example`) with safe development
 * defaults. Do not read `process.env` or hardcode config/secrets elsewhere —
 * add a field here instead, so the whole configuration surface is auditable.
 */

/** Parse a numeric env var, falling back to a default when unset/invalid. */
const num = (value: string | undefined, fallback: number): number => {
  const parsed = value === undefined ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Parse a comma-separated env var into a trimmed, non-empty string array. */
const list = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nodeEnv = process.env.NODE_ENV ?? "development";

export const config = {
  /** Node environment ("development" | "production" | "test"). */
  nodeEnv,
  /** True in production — enables strict auth and disables schema auto-sync. */
  isProduction: nodeEnv === "production",
  /** HTTP port the API listens on. */
  port: num(process.env.PORT, 3001),
  /** Allowed browser origins for CORS (comma-separated). Empty = reflect request origin (dev only). */
  webOrigins: list(process.env.WEB_ORIGIN),
  /** Maximum accepted JSON request body size. */
  jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? "1mb",

  db: {
    /** Preferred: full Postgres/Supabase connection string (use the session pooler :5432 or a direct connection). */
    url: process.env.DATABASE_URL,
    /** Discrete fallbacks used only when DATABASE_URL is unset (local dev). */
    host: process.env.DB_HOST ?? "localhost",
    port: num(process.env.DB_PORT, 5432),
    username: process.env.DB_USERNAME ?? "postgres",
    password: process.env.DB_PASSWORD ?? "password",
    database: process.env.DB_DATABASE ?? "voltph",
  },

  supabase: {
    /** Supabase project URL. */
    url: process.env.SUPABASE_URL,
    /** Server-only privileged key — never expose to clients. */
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    /** Secret used to verify Supabase-issued JWTs (HS256). Unset → dev auth bypass (non-production only). */
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },

  googleMaps: {
    /** Google Maps Platform key (Directions/Routes, Elevation, Places). Unset → haversine distance fallback. */
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    /** Timeout (ms) for the Directions request. */
    directionsTimeoutMs: num(process.env.GMAPS_DIRECTIONS_TIMEOUT_MS, 8000),
    /** Timeout (ms) for the Elevation request. */
    elevationTimeoutMs: num(process.env.GMAPS_ELEVATION_TIMEOUT_MS, 6000),
    /** Max points per Elevation request (API hard limit is 512). */
    maxElevationPoints: num(process.env.GMAPS_MAX_ELEVATION_POINTS, 350),
  },

  weather: {
    /** Open-Meteo forecast endpoint (free, no key). */
    openMeteoUrl:
      process.env.OPEN_METEO_URL ?? "https://api.open-meteo.com/v1/forecast",
    /** Timeout (ms) for the weather lookup. */
    timeoutMs: num(process.env.WEATHER_TIMEOUT_MS, 3000),
  },

  routing: {
    /** Road-network detour multiplier applied to straight-line distance in the no-API fallback. */
    detourFactor: num(process.env.ROUTE_DETOUR_FACTOR, 1.3),
    /** Nominal average urban speed (km/h) for the no-API duration estimate. */
    fallbackAvgSpeedKmh: num(process.env.FALLBACK_AVG_SPEED_KMH, 30),
  },

  stations: {
    /** Radius (meters) for "nearby charging stations" lookups. */
    searchRadiusM: num(process.env.STATION_SEARCH_RADIUS_M, 10000),
    /** Maximum stations returned per lookup. */
    nearbyLimit: num(process.env.NEARBY_STATION_LIMIT, 5),
  },

  trip: {
    /** Arrival SoC (%) below which the API recommends charging stops. */
    lowSocThresholdPercent: num(process.env.LOW_SOC_THRESHOLD_PERCENT, 20),
  },
};

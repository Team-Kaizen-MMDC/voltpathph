// Base URL of the Voltpath PH API. Configured via VITE_API_URL (inlined at
// build time by Vite, which reads the monorepo-root .env via envDir); defaults
// to the local dev API. See the root .env.example.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

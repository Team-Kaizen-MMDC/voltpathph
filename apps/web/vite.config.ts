import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load env files from the monorepo root (single consolidated .env).
  // Only VITE_* variables are exposed to the client bundle.
  envDir: "../..",
});

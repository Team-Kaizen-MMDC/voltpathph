import { defineConfig } from "vitest/config";

// Only run tests from source — never the compiled copies under dist/.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});

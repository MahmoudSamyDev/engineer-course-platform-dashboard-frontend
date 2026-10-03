import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: the React Router plugin is not used in unit/component tests.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    css: false,
    env: {
      VITE_API_BASE_URL: "http://localhost/api/v1",
    },
  },
});

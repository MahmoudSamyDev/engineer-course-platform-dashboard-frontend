import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { msw } from "msw/vite";
import { readFileSync } from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Demo builds only (VITE_DEMO=true): puts the mock API's service worker at the site root, so a
 * deployed preview can answer API calls with sample data. Normal builds never include it.
 */
function demoServiceWorker(): Plugin {
  return {
    name: "demo-service-worker",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "mockServiceWorker.js",
        source: readFileSync("node_modules/msw/lib/mockServiceWorker.js"),
      });
    },
  };
}

export default defineConfig(({ command, mode }) => ({
  plugins: [
    tailwindcss(),
    reactRouter(),
    // Serves mockServiceWorker.js during development only (SRS DMK-05).
    // The production build never contains the worker or the mock handlers.
    ...(command === "serve" ? [msw({ mode: "worker-only" })] : []),
    ...(command === "build" && loadEnv(mode, process.cwd(), "").VITE_DEMO === "true"
      ? [demoServiceWorker()]
      : []),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
  },
  // Pre-bundle on first start so the first page load doesn't trigger a reload.
  optimizeDeps: {
    include: [
      "@hookform/resolvers/zod",
      "@reduxjs/toolkit",
      "@reduxjs/toolkit/query",
      "@reduxjs/toolkit/query/react",
      "lucide-react",
      "msw",
      "msw/browser",
      "radix-ui",
      "react-hook-form",
      "react-redux",
      "use-intl",
      "zod",
    ],
  },
}));

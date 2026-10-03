import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { msw } from "msw/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    reactRouter(),
    // Serves mockServiceWorker.js during development only (SRS DMK-05).
    // The production build never contains the worker or the mock handlers.
    ...(command === "serve" ? [msw({ mode: "worker-only" })] : []),
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

import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

/**
 * Starts the mock API before the router's first data request (SRS §7.4, DMK-05).
 * `import.meta.env.DEV` is false in production builds, so the mock code is dropped entirely.
 */
async function enableMocking(): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === "true") {
    const { startMockWorker } = await import("./mocks/browser");
    await startMockWorker();
  }
}

void enableMocking().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
});

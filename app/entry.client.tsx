import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

/**
 * Starts the mock API before the router's first data request (SRS §7.4, DMK-05).
 * Both conditions are build-time constants: in a normal production build (no VITE_DEMO) they are
 * false and the mock code is dropped entirely. A demo build (VITE_DEMO=true) keeps it, so a
 * deployed preview works with sample data and no backend.
 */
async function enableMocking(): Promise<void> {
  if (
    (import.meta.env.DEV || import.meta.env.VITE_DEMO === "true") &&
    import.meta.env.VITE_API_MOCKING === "true"
  ) {
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

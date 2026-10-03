import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Starts the in-browser mock API (development only — see entry.client.tsx). */
export async function startMockWorker(): Promise<void> {
  const worker = setupWorker(...handlers);
  await worker.start({
    // Fonts, the app's own modules and HMR requests are not API calls.
    onUnhandledFrame: "bypass",
    quiet: true,
  });
}

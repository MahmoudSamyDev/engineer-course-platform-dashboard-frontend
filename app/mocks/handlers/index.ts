import { http } from "msw";
import { MOCK_API } from "../config";
import { apiError, currentAdmin, forcedError } from "../http";
import { authHandlers } from "./auth";

/**
 * Runs before every non-auth admin endpoint: 401 without a mock session (DBR-01),
 * and `?mockError=` support (DMK-03). Returning nothing lets the next handler answer.
 */
const guard = http.all(`${MOCK_API}/*`, ({ request }) => {
  if (new URL(request.url).pathname.includes("/admin/auth/")) return;
  const forced = forcedError();
  if (forced) return forced;
  if (!currentAdmin()) return apiError(401, "UNAUTHENTICATED", "Sign in to continue.");
});

/**
 * Order matters: auth endpoints, then the guard, then feature handlers (added as each
 * phase lands: D6 overview, D7 registrations…). A request the guard lets through falls
 * through to the matching feature handler.
 */
export const handlers = [...authHandlers, guard];

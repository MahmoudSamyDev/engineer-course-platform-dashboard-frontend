import { describe, expect, it } from "vitest";
import { authApi } from "~/features/auth/api";
import { paymentsApi } from "~/features/payments/api";
import { mockSession } from "~/mocks/db";
import { makeStore } from "~/store/store";
import { selectSessionEnded } from "~/store/ui-slice";

/** DSH-AUTH-05: a 401 from a data endpoint means the session ended mid-use. */
describe("session expiry (DSH-AUTH-05)", () => {
  it("flags the session as ended when a data request answers 401", async () => {
    const store = makeStore();
    mockSession.set("adm_owner");
    await store.dispatch(paymentsApi.endpoints.getPayments.initiate({ page: 1 }));
    expect(selectSessionEnded(store.getState())).toBe(false);

    mockSession.clear(); // The API's idle or absolute timeout.
    await store.dispatch(
      paymentsApi.endpoints.getPayments.initiate({ page: 2 }, { forceRefetch: true }),
    );
    expect(selectSessionEnded(store.getState())).toBe(true);
  });

  it("treats a 401 from `me` or a failed sign-in as an answer, not an expired session", async () => {
    const store = makeStore();
    await store.dispatch(authApi.endpoints.me.initiate());
    await store.dispatch(
      authApi.endpoints.login.initiate({ email: "owner@example.com", password: "wrong-password" }),
    );
    expect(selectSessionEnded(store.getState())).toBe(false);
  });
});

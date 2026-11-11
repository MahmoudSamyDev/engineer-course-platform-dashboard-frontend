import { http, HttpResponse } from "msw";
import { RouterContextProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { userContext } from "~/features/auth/context";
import { MOCK_API } from "~/mocks/config";
import { mockSession } from "~/mocks/db";
import { server } from "~/mocks/node";
import { clientMiddleware } from "~/routes/app-layout";
import { api } from "~/store/api";
import { store } from "~/store/store";

/** Runs the app layout's auth guard for `/payments` and returns what it threw (or the user). */
async function runGuard() {
  const context = new RouterContextProvider();
  const guard = clientMiddleware[0]!;
  try {
    await guard(
      {
        request: new Request("http://localhost/payments?status=REFUNDED"),
        params: {},
        context,
        unstable_pattern: "/payments",
      } as unknown as Parameters<typeof guard>[0],
      async () => ({}),
    );
    return { user: context.get(userContext) };
  } catch (thrown) {
    return { thrown: thrown as Response | { status: number; init?: ResponseInit } };
  }
}

beforeEach(() => {
  store.dispatch(api.util.resetApiState());
});

describe("auth guard (DSH-AUTH-04/05, ISSUES #1)", () => {
  it("lets a signed-in user through", async () => {
    mockSession.set("adm_owner");
    const { user, thrown } = await runGuard();
    expect(thrown).toBeUndefined();
    expect(user?.email).toBe("owner@example.com");
  });

  it("sends a signed-out user to sign-in, keeping the way back", async () => {
    const { thrown } = await runGuard();
    expect(thrown).toBeInstanceOf(Response);
    const response = thrown as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/login?next=%2Fpayments%3Fstatus%3DREFUNDED");
  });

  it("shows an error instead of signing out when the API is down", async () => {
    mockSession.set("adm_owner");
    server.use(
      http.get(`${MOCK_API}/auth/me`, () =>
        HttpResponse.json({ error: { code: "INTERNAL", message: "down" } }, { status: 500 }),
      ),
    );
    const { thrown } = await runGuard();
    expect(thrown).not.toBeInstanceOf(Response);
    expect(thrown).toMatchObject({ init: { status: 503 } });
  });

  it("shows an error instead of signing out when the browser is offline", async () => {
    mockSession.set("adm_owner");
    server.use(http.get(`${MOCK_API}/auth/me`, () => HttpResponse.error()));
    const { thrown } = await runGuard();
    expect(thrown).toMatchObject({ init: { status: 503 } });
  });
});

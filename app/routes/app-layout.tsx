import { useEffect } from "react";
import { Outlet, redirect, useLocation, useNavigate } from "react-router";
import { AppShell } from "~/components/layout/app-shell";
import { authApi, useMeQuery } from "~/features/auth/api";
import { userContext } from "~/features/auth/context";
import { loginPathFor } from "~/features/auth/redirect";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { store } from "~/store/store";
import { localeChanged, selectLocale, selectSessionEnded, sessionRestored } from "~/store/ui-slice";
import type { Route } from "./+types/app-layout";

/**
 * Auth guard for every signed-in route (SRS DSH-AUTH-04). Runs on every client navigation;
 * `me` is cached by RTK Query, so only the first navigation waits for the API.
 */
const requireUser: Route.ClientMiddlewareFunction = async ({ request, context }) => {
  const result = await store.dispatch(
    authApi.endpoints.me.initiate(undefined, { subscribe: false }),
  );
  if (!result.data) {
    throw redirect(loginPathFor(new URL(request.url)));
  }
  context.set(userContext, result.data);
};

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireUser];

// A clientLoader makes the middleware run on the first load too, and hands the user to the layout.
export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  return { user: context.get(userContext) };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { data: liveUser } = useMeQuery();
  const user = liveUser ?? loaderData.user;
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectLocale);
  const sessionEnded = useAppSelector(selectSessionEnded);
  const navigate = useNavigate();
  const location = useLocation();

  // The signed-in user's saved language wins over the browser's last choice.
  useEffect(() => {
    if (user.locale !== locale) dispatch(localeChanged(user.locale));
    // Only when the user (or their saved preference) changes — not on every toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.locale]);

  // A 401 mid-session: back to sign-in, then return here (DSH-AUTH-05).
  useEffect(() => {
    if (!sessionEnded) return;
    dispatch(sessionRestored());
    const url = new URL(location.pathname + location.search, window.location.origin);
    navigate(loginPathFor(url, "expired"), { replace: true });
  }, [sessionEnded, dispatch, navigate, location]);

  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}

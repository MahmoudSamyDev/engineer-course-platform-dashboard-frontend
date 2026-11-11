import type { AdminUser, ItemResponse } from "~/domain/admin";
import type { ChangePasswordInput } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { api } from "~/store/api";
import { sessionRestored } from "~/store/ui-slice";
import type { LoginInput } from "./schema";

/** SRS §7.2 — /admin/auth/*. */
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    me: build.query<AdminUser, void>({
      query: () => "/auth/me",
      transformResponse: (response: ItemResponse<AdminUser>) => response.data,
      providesTags: ["Me"],
    }),
    login: build.mutation<AdminUser, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ItemResponse<AdminUser>) => response.data,
      // A late 401 from the previous session may have raised "session ended" while on the
      // sign-in page: clear it. (The form seeds `me` itself and waits for it, see login.tsx.)
      async onQueryStarted(_input, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(sessionRestored());
        } catch {
          // A failed sign-in is handled by the form (mutation result).
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      // Sign-out clears every cached record (DSH-AUTH-06, DNFR-PRIV-03) — done by the sign-in
      // page when it opens (login.tsx). Resetting here, while the signed-in page is still
      // mounted, made it refetch, get a 401, and show "Your session has ended" instead.
    }),
    updateMyLocale: build.mutation<AdminUser, Locale>({
      query: (locale) => ({ url: "/auth/me", method: "PATCH", body: { locale } }),
      transformResponse: (response: ItemResponse<AdminUser>) => response.data,
      async onQueryStarted(locale, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData("me", undefined, (draft) => {
            draft.locale = locale;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    /** DSH-PRO-08 — the signed-in user's display name. */
    updateMyName: build.mutation<AdminUser, string>({
      query: (name) => ({ url: "/auth/me", method: "PATCH", body: { name } }),
      transformResponse: (response: ItemResponse<AdminUser>) => response.data,
      async onQueryStarted(_name, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          dispatch(authApi.util.upsertQueryData("me", undefined, user));
        } catch {
          // The form shows the error; the cached user stays as it was.
        }
      },
    }),
    /** DSH-AUTH-08 — a wrong current password is a field error (422), not a 401. */
    changePassword: build.mutation<void, ChangePasswordInput>({
      query: (body) => ({ url: "/auth/password", method: "POST", body }),
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useUpdateMyLocaleMutation,
  useUpdateMyNameMutation,
  useChangePasswordMutation,
} = authApi;

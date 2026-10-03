import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { ApiError } from "~/domain/admin";
import { sessionEnded } from "./ui-slice";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/admin`,
  // The session lives in an httpOnly cookie set by the API (SRS DSH-AUTH-03).
  credentials: "include",
  prepareHeaders(headers) {
    // CSRF guard required by the API on every request (SRS §7.2).
    headers.set("X-Requested-With", "dashboard");
    return headers;
  },
});

/** Endpoints where a 401 is an expected answer, not an expired session. */
const AUTH_ENDPOINTS = new Set(["me", "login"]);

/**
 * Wraps fetchBaseQuery: a 401 from any data endpoint means the session ended (idle or
 * absolute timeout, sign-out elsewhere). The app layout reacts by sending the user to
 * /login?next=… (SRS DSH-AUTH-05).
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && !AUTH_ENDPOINTS.has(api.endpoint)) {
    api.dispatch(sessionEnded());
  }
  return result;
};

/**
 * The one RTK Query API slice (SRS DC-02). Features add endpoints with
 * `api.injectEndpoints` in `app/features/<feature>/api.ts`.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Me",
    "Overview",
    "Registration",
    "Student",
    "Payment",
    "Course",
    "Session",
    "Assistant",
    "Instructor",
    "Message",
    "Location",
  ],
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

/** Narrows an RTK Query error to the API's `{ error: { code, message } }` shape. */
export function getApiError(error: unknown): ApiError["error"] | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data: unknown }).data === "object" &&
    (error as { data: ApiError | null }).data?.error
  ) {
    return (error as { data: ApiError }).data.error;
  }
  return null;
}

/** True when the request never got an HTTP answer (offline, DNS, CORS). */
export function isNetworkError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as FetchBaseQueryError).status === "FETCH_ERROR"
  );
}

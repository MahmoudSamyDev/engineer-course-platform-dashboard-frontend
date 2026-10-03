import type { ItemResponse } from "~/domain/admin";
import type { NavCounts, Overview } from "~/domain/api";
import { api } from "~/store/api";

/** SRS §7.2 — GET /admin/overview, GET /admin/counts. */
export const overviewApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query<Overview, void>({
      query: () => "/overview",
      transformResponse: (r: ItemResponse<Overview>) => r.data,
      providesTags: ["Overview"],
    }),
    getCounts: build.query<NavCounts, void>({
      query: () => "/counts",
      transformResponse: (r: ItemResponse<NavCounts>) => r.data,
      providesTags: ["Counts"],
    }),
  }),
});

export const { useGetOverviewQuery, useGetCountsQuery } = overviewApi;

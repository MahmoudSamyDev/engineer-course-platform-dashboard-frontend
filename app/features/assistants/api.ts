import type { ItemResponse, ListResponse } from "~/domain/admin";
import type { Assistant, AssistantInput } from "~/domain/api";
import { api, toQueryString } from "~/store/api";

/** SRS §7.2 — assistants (DSH-ASS). */
export const assistantsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAssistants: build.query<Assistant[], { active?: "true" | "false"; q?: string }>({
      query: (params) => `/assistants${toQueryString(params)}`,
      transformResponse: (r: ListResponse<Assistant>) => r.data,
      providesTags: [{ type: "Assistant", id: "LIST" }],
    }),
    createAssistant: build.mutation<Assistant, AssistantInput>({
      query: (body) => ({ url: "/assistants", method: "POST", body }),
      transformResponse: (r: ItemResponse<Assistant>) => r.data,
      invalidatesTags: [{ type: "Assistant", id: "LIST" }],
    }),
    updateAssistant: build.mutation<
      Assistant,
      { id: string } & Partial<AssistantInput> & { isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/assistants/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: ItemResponse<Assistant>) => r.data,
      invalidatesTags: [{ type: "Assistant", id: "LIST" }],
    }),
    deleteAssistant: build.mutation<void, string>({
      query: (id) => ({ url: `/assistants/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Assistant", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAssistantsQuery,
  useCreateAssistantMutation,
  useUpdateAssistantMutation,
  useDeleteAssistantMutation,
} = assistantsApi;

import type { ItemResponse, ListResponse } from "~/domain/admin";
import type { ContactMessage, MessageStatus } from "~/domain/api";
import { api } from "~/store/api";

/** SRS §7.2 — contact messages (DSH-MSG). */
export const messagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMessages: build.query<ContactMessage[], { archived: boolean }>({
      query: ({ archived }) => `/messages${archived ? "?status=ARCHIVED" : ""}`,
      transformResponse: (r: ListResponse<ContactMessage>) => r.data,
      providesTags: [{ type: "Message", id: "LIST" }],
    }),
    setMessageStatus: build.mutation<ContactMessage, { id: string; status: MessageStatus }>({
      query: ({ id, status }) => ({ url: `/messages/${encodeURIComponent(id)}`, method: "PATCH", body: { status } }),
      transformResponse: (r: ItemResponse<ContactMessage>) => r.data,
      invalidatesTags: [{ type: "Message", id: "LIST" }, "Counts", "Overview"],
    }),
  }),
});

export const { useGetMessagesQuery, useSetMessageStatusMutation } = messagesApi;

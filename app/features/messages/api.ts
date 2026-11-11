import type { ItemResponse, ListResponse } from "~/domain/admin";
import type { ContactMessage, MessageStatus } from "~/domain/api";
import { api } from "~/store/api";
import { overviewApi } from "../overview/api";

/** SRS §7.2 — contact messages (DSH-MSG). */
export const messagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Inbox = New + Read, newest first; Archived on its own (DSH-MSG-01). */
    getMessages: build.query<ContactMessage[], { archived: boolean }>({
      query: ({ archived }) => `/messages${archived ? "?status=ARCHIVED" : ""}`,
      transformResponse: (r: ListResponse<ContactMessage>) => r.data,
      providesTags: [{ type: "Message", id: "LIST" }],
    }),
    /**
     * Read / New / Archived (DSH-MSG-02). Optimistic: the message moves between the cached
     * lists and the nav badge changes at once (DSH-MSG-03); a failure puts everything back.
     */
    setMessageStatus: build.mutation<ContactMessage, { id: string; status: MessageStatus }>({
      query: ({ id, status }) => ({
        url: `/messages/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: ItemResponse<ContactMessage>) => r.data,
      async onQueryStarted({ id, status }, { dispatch, getState, queryFulfilled }) {
        const cached = [false, true]
          .flatMap(
            (archived) =>
              messagesApi.endpoints.getMessages.select({ archived })(getState()).data ?? [],
          )
          .find((m) => m.id === id);
        const before = cached?.status;
        const updated = cached ? { ...cached, status } : undefined;

        const patches = [false, true].map((archived) =>
          dispatch(
            messagesApi.util.updateQueryData("getMessages", { archived }, (list) => {
              const index = list.findIndex((m) => m.id === id);
              const belongs = (status === "ARCHIVED") === archived;
              if (index >= 0 && belongs) list[index]!.status = status;
              else if (index >= 0) list.splice(index, 1);
              else if (belongs && updated) {
                list.push(updated);
                list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              }
            }),
          ),
        );
        const delta = (before === "NEW" ? -1 : 0) + (status === "NEW" ? 1 : 0);
        if (before && delta !== 0) {
          patches.push(
            dispatch(
              overviewApi.util.updateQueryData("getCounts", undefined, (counts) => {
                counts.newMessages = Math.max(0, counts.newMessages + delta);
              }),
            ),
          );
        }
        try {
          await queryFulfilled;
        } catch {
          for (const patch of patches) patch.undo();
        }
      },
      // The server's own numbers win once it has answered.
      invalidatesTags: [{ type: "Message", id: "LIST" }, "Counts", "Overview"],
    }),
  }),
});

export const { useGetMessagesQuery, useSetMessageStatusMutation } = messagesApi;

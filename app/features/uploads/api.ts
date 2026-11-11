import type { ItemResponse } from "~/domain/admin";
import type { UploadKind } from "~/domain/uploads";
import { api } from "~/store/api";

export type UploadedImage = { url: string; width: number; height: number };

/** SRS §7.2 — `POST /admin/uploads` (instructor photo, assistant photo, certification image). */
export const uploadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<UploadedImage, { file: File; kind: UploadKind }>({
      query: ({ file, kind }) => {
        const body = new FormData();
        body.set("file", file);
        body.set("kind", kind);
        return { url: "/uploads", method: "POST", body };
      },
      transformResponse: (r: ItemResponse<UploadedImage>) => r.data,
    }),
  }),
});

export const { useUploadImageMutation } = uploadsApi;

import type { ItemResponse } from "~/domain/admin";
import type { CertificationDto, InstructorProfile, MilestoneDto, UpdateInstructorInput } from "~/domain/api";
import { api } from "~/store/api";

type Upload = { url: string; width: number; height: number };

/** SRS §7.2 — instructor profile (DSH-PRO) and image uploads. */
export const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInstructor: build.query<InstructorProfile, void>({
      query: () => "/instructor",
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      providesTags: ["Instructor"],
    }),
    updateInstructor: build.mutation<InstructorProfile, UpdateInstructorInput>({
      query: (body) => ({ url: "/instructor", method: "PATCH", body }),
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      invalidatesTags: ["Instructor"],
    }),
    replaceCertifications: build.mutation<InstructorProfile, CertificationDto[]>({
      query: (body) => ({ url: "/instructor/certifications", method: "PUT", body }),
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      invalidatesTags: ["Instructor"],
    }),
    replaceJourney: build.mutation<InstructorProfile, MilestoneDto[]>({
      query: (body) => ({ url: "/instructor/journey", method: "PUT", body }),
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      invalidatesTags: ["Instructor"],
    }),
    uploadImage: build.mutation<Upload, { file: File; kind: "instructor-photo" | "assistant-photo" | "certification" }>({
      query: ({ file, kind }) => {
        const body = new FormData();
        body.set("file", file);
        body.set("kind", kind);
        return { url: "/uploads", method: "POST", body };
      },
      transformResponse: (r: ItemResponse<Upload>) => r.data,
    }),
  }),
});

export const {
  useGetInstructorQuery,
  useUpdateInstructorMutation,
  useReplaceCertificationsMutation,
  useReplaceJourneyMutation,
  useUploadImageMutation,
} = profileApi;

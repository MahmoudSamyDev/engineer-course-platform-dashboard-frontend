import type { ItemResponse } from "~/domain/admin";
import type {
  CertificationDto,
  InstructorProfile,
  MilestoneDto,
  UpdateInstructorInput,
} from "~/domain/api";
import { api } from "~/store/api";
import type { AppDispatch } from "~/store/store";

/** Every profile save answers with the whole profile: cache it at once (see courses/api.ts). */
async function writeInstructorCache({
  dispatch,
  queryFulfilled,
}: {
  dispatch: AppDispatch;
  queryFulfilled: Promise<{ data: InstructorProfile }>;
}) {
  try {
    const { data } = await queryFulfilled;
    dispatch(profileApi.util.upsertQueryData("getInstructor", undefined, data));
  } catch {
    // The tab shows the error.
  }
}

/** SRS §7.2 — instructor profile (DSH-PRO). Uploads live in `features/uploads`. */
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
      onQueryStarted: (_input, api) => writeInstructorCache(api),
      invalidatesTags: ["Instructor"],
    }),
    replaceCertifications: build.mutation<InstructorProfile, CertificationDto[]>({
      query: (body) => ({ url: "/instructor/certifications", method: "PUT", body }),
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      onQueryStarted: (_input, api) => writeInstructorCache(api),
      invalidatesTags: ["Instructor"],
    }),
    replaceJourney: build.mutation<InstructorProfile, MilestoneDto[]>({
      query: (body) => ({ url: "/instructor/journey", method: "PUT", body }),
      transformResponse: (r: ItemResponse<InstructorProfile>) => r.data,
      onQueryStarted: (_input, api) => writeInstructorCache(api),
      invalidatesTags: ["Instructor"],
    }),
  }),
});

export const {
  useGetInstructorQuery,
  useUpdateInstructorMutation,
  useReplaceCertificationsMutation,
  useReplaceJourneyMutation,
} = profileApi;

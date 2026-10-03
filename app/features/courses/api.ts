import type { ItemResponse, ListResponse } from "~/domain/admin";
import type {
  CourseCard,
  CourseCounts,
  CourseDetail,
  CourseModuleInput,
  CreateCourseInput,
  FaqInput,
  LocationOption,
  SessionDetail,
  SessionInput,
  SessionRow,
  UpdateCourseInput,
} from "~/domain/api";
import { api, toQueryString } from "~/store/api";

type Item<T> = ItemResponse<T>;
const unwrap = <T,>(r: Item<T>) => r.data;

/** SRS §7.2 — courses, sessions, check-ins, locations (DSH-CRS, DSH-SES, DSH-ATT). */
export const coursesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCourses: build.query<{ items: CourseCard[]; counts: CourseCounts }, { state?: string; q?: string }>({
      query: (params) => `/courses${toQueryString(params)}`,
      transformResponse: (r: ListResponse<CourseCard> & { meta: { counts: CourseCounts } }) => ({
        items: r.data,
        counts: r.meta.counts,
      }),
      providesTags: [{ type: "Course", id: "LIST" }],
    }),
    getCourse: build.query<CourseDetail, string>({
      query: (id) => `/courses/${encodeURIComponent(id)}`,
      transformResponse: unwrap<CourseDetail>,
      providesTags: (_r, _e, id) => [{ type: "Course", id }],
    }),
    createCourse: build.mutation<CourseDetail, CreateCourseInput>({
      query: (body) => ({ url: "/courses", method: "POST", body }),
      transformResponse: unwrap<CourseDetail>,
      invalidatesTags: [{ type: "Course", id: "LIST" }, "Overview"],
    }),
    updateCourse: build.mutation<CourseDetail, { id: string } & UpdateCourseInput>({
      query: ({ id, ...body }) => ({ url: `/courses/${encodeURIComponent(id)}`, method: "PATCH", body }),
      transformResponse: unwrap<CourseDetail>,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Course", id }, { type: "Course", id: "LIST" }, "Overview"],
    }),
    replaceModules: build.mutation<CourseDetail, { id: string; modules: CourseModuleInput[] }>({
      query: ({ id, modules }) => ({ url: `/courses/${encodeURIComponent(id)}/modules`, method: "PUT", body: modules }),
      transformResponse: unwrap<CourseDetail>,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Course", id }],
    }),
    replaceFaq: build.mutation<CourseDetail, { id: string; faq: FaqInput[] }>({
      query: ({ id, faq }) => ({ url: `/courses/${encodeURIComponent(id)}/faq`, method: "PUT", body: faq }),
      transformResponse: unwrap<CourseDetail>,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Course", id }],
    }),
    setCourseArchived: build.mutation<CourseDetail, { id: string; archived: boolean }>({
      query: ({ id, archived }) => ({
        url: `/courses/${encodeURIComponent(id)}/${archived ? "archive" : "restore"}`,
        method: "POST",
      }),
      transformResponse: unwrap<CourseDetail>,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Course", id }, { type: "Course", id: "LIST" }, "Overview"],
    }),
    deleteCourse: build.mutation<void, string>({
      query: (id) => ({ url: `/courses/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    getCourseSessions: build.query<SessionRow[], string>({
      query: (courseId) => `/courses/${encodeURIComponent(courseId)}/sessions`,
      transformResponse: unwrap<SessionRow[]>,
      providesTags: (_r, _e, courseId) => [{ type: "Session", id: `COURSE-${courseId}` }],
    }),
    createSession: build.mutation<SessionRow, { courseId: string } & SessionInput>({
      query: ({ courseId, ...body }) => ({ url: `/courses/${encodeURIComponent(courseId)}/sessions`, method: "POST", body }),
      transformResponse: unwrap<SessionRow>,
      invalidatesTags: (_r, _e, { courseId }) => [
        { type: "Session", id: `COURSE-${courseId}` },
        { type: "Course", id: courseId },
        { type: "Course", id: "LIST" },
        "Overview",
      ],
    }),
    getSession: build.query<SessionDetail, string>({
      query: (id) => `/sessions/${encodeURIComponent(id)}`,
      transformResponse: unwrap<SessionDetail>,
      providesTags: (_r, _e, id) => [{ type: "Session", id }],
    }),
    updateSession: build.mutation<SessionRow, { id: string; courseId: string } & Partial<SessionInput>>({
      query: ({ id, courseId: _courseId, ...body }) => ({ url: `/sessions/${encodeURIComponent(id)}`, method: "PATCH", body }),
      transformResponse: unwrap<SessionRow>,
      invalidatesTags: (_r, _e, { id, courseId }) => [
        { type: "Session", id },
        { type: "Session", id: `COURSE-${courseId}` },
        { type: "Course", id: courseId },
        { type: "Course", id: "LIST" },
        "Overview",
      ],
    }),
    setSessionClosed: build.mutation<SessionRow, { id: string; courseId: string; closed: boolean }>({
      query: ({ id, closed }) => ({ url: `/sessions/${encodeURIComponent(id)}/${closed ? "close" : "reopen"}`, method: "POST" }),
      transformResponse: unwrap<SessionRow>,
      invalidatesTags: (_r, _e, { id, courseId }) => [
        { type: "Session", id },
        { type: "Session", id: `COURSE-${courseId}` },
        { type: "Course", id: courseId },
        { type: "Course", id: "LIST" },
        "Overview",
      ],
    }),
    deleteSession: build.mutation<void, { id: string; courseId: string }>({
      query: ({ id }) => ({ url: `/sessions/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { courseId }) => [
        { type: "Session", id: `COURSE-${courseId}` },
        { type: "Course", id: courseId },
        { type: "Course", id: "LIST" },
      ],
    }),
    getLocations: build.query<LocationOption[], void>({
      query: () => "/locations",
      transformResponse: unwrap<LocationOption[]>,
      providesTags: ["Location"],
      keepUnusedDataFor: 600,
    }),
    checkIn: build.mutation<unknown, { sessionId: string; bookingId: string; meetingId: string }>({
      query: ({ bookingId, meetingId }) => ({ url: "/checkins", method: "POST", body: { bookingId, meetingId } }),
      invalidatesTags: (_r, _e, { sessionId }) => [{ type: "Session", id: sessionId }, "Registration", "Student"],
    }),
    undoCheckIn: build.mutation<void, { sessionId: string; checkInId: string }>({
      query: ({ checkInId }) => ({ url: `/checkins/${encodeURIComponent(checkInId)}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { sessionId }) => [{ type: "Session", id: sessionId }, "Registration", "Student"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useReplaceModulesMutation,
  useReplaceFaqMutation,
  useSetCourseArchivedMutation,
  useDeleteCourseMutation,
  useGetCourseSessionsQuery,
  useCreateSessionMutation,
  useGetSessionQuery,
  useUpdateSessionMutation,
  useSetSessionClosedMutation,
  useDeleteSessionMutation,
  useGetLocationsQuery,
  useCheckInMutation,
  useUndoCheckInMutation,
} = coursesApi;

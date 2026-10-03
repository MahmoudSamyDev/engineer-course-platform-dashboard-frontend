import type { ItemResponse, ListResponse } from "~/domain/admin";
import type { Page, RegistrationFilters, RegistrationRow, StudentDetail } from "~/domain/api";
import { api, toQueryString } from "~/store/api";

/** SRS §7.2 — registrations and student details (DSH-STU). */
export const studentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRegistrations: build.query<Page<RegistrationRow>, RegistrationFilters>({
      query: (filters) => `/registrations${toQueryString(filters)}`,
      transformResponse: (r: ListResponse<RegistrationRow>) => ({ items: r.data, ...r.meta }),
      providesTags: [{ type: "Registration", id: "LIST" }],
    }),
    getStudent: build.query<StudentDetail, string>({
      query: (id) => `/students/${encodeURIComponent(id)}`,
      transformResponse: (r: ItemResponse<StudentDetail>) => r.data,
      providesTags: (_r, _e, id) => [{ type: "Student", id }],
    }),
  }),
});

export const { useGetRegistrationsQuery, useGetStudentQuery } = studentsApi;

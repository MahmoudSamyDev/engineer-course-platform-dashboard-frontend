import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

/** SRS §3.2. Route modules stay thin: data prefetch + page composition from app/features. */
export default [
  route("login", "routes/login.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("students", "routes/students.tsx"),
    route("students/:studentId", "routes/student.tsx"),
    route("payments", "routes/payments.tsx"),
    route("courses", "routes/courses.tsx"),
    route("courses/:courseId", "routes/course.tsx"),
    route("courses/:courseId/sessions/:sessionId", "routes/session.tsx"),
    route("assistants", "routes/assistants.tsx"),
    route("messages", "routes/messages.tsx"),
    route("profile", "routes/profile.tsx"),
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;

/**
 * ⚠️ MOCK DATABASE — development and tests only (SRS §7.4).
 * In-memory records shaped like the shared Prisma model. Seeded from the Website's
 * placeholder data in ./seed (instructor, courses, sessions, locations); students,
 * bookings and payments are generated in later phases (D6+).
 */
import type { AdminUser } from "~/domain/admin";
import { courses } from "./seed/courses";
import { certifications, instructor, journey } from "./seed/instructor";
import { departments, locations } from "./seed/locations";
import { sessions } from "./seed/sessions";

type MockAdmin = AdminUser & { password: string };

/** DMK-04 — mock-only credentials, documented in the README. Never used by the real API. */
export const MOCK_PASSWORD = "dashboard-demo";

function createDb() {
  return {
    admins: [
      {
        id: "adm_owner",
        name: "Karim Mostafa",
        email: "owner@example.com",
        role: "OWNER",
        locale: "ar",
        lastLoginAt: null,
        password: MOCK_PASSWORD,
      },
      {
        id: "adm_admin",
        name: "Mahmoud Samy",
        email: "admin@example.com",
        role: "ADMIN",
        locale: "ar",
        lastLoginAt: null,
        password: MOCK_PASSWORD,
      },
    ] satisfies MockAdmin[] as MockAdmin[],
    instructor: structuredClone(instructor),
    certifications: structuredClone(certifications),
    journey: structuredClone(journey),
    courses: structuredClone(courses),
    sessions: structuredClone(sessions),
    locations: structuredClone(locations),
    departments: structuredClone(departments),
  };
}

export let db = createDb();

/** Tests call this between cases so every test starts from the same data. */
export function resetDb(): void {
  db = createDb();
  mockSession.clear();
}

export function toPublicAdmin({ password: _password, ...admin }: MockAdmin): AdminUser {
  return admin;
}

/**
 * Mock stand-in for the API's httpOnly session cookie. Kept in sessionStorage so a
 * page reload during development doesn't sign you out (the real API uses a cookie).
 */
const SESSION_KEY = "dashboard.mock-session";
let memorySession: string | null = null;

export const mockSession = {
  get(): string | null {
    if (typeof window === "undefined") return memorySession;
    try {
      return window.sessionStorage.getItem(SESSION_KEY);
    } catch {
      return memorySession;
    }
  },
  set(userId: string): void {
    memorySession = userId;
    try {
      window.sessionStorage.setItem(SESSION_KEY, userId);
    } catch {
      // jsdom / blocked storage: memory only.
    }
  },
  clear(): void {
    memorySession = null;
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  },
};

/** Lockout bookkeeping for DSH-AUTH-02 (5 failures in 15 minutes). */
export const failedAttempts = new Map<string, number[]>();

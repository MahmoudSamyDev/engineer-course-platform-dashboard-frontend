import { createContext } from "react-router";
import type { AdminUser } from "~/domain/admin";

/** The signed-in user, set by the app layout's clientMiddleware for every protected route. */
export const userContext = createContext<AdminUser>();

import { z } from "zod";

/** Sign-in form and request body (SRS DSH-AUTH-01). The API validates the same shape. */
export const loginSchema = z.object({
  email: z.string().trim().min(1, "required").email("email"),
  password: z.string().min(1, "required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Sign-in form and request body (SRS DSH-AUTH-01). The API validates the same shape.
 *
 * A plain function, not react-hook-form + Zod: two fields don't need them, and together they
 * were 26 KB gzip of the sign-in page's 200 KB budget (DNFR-PERF-01, DD-053). The other
 * forms still use RHF + Zod; they load with their own pages.
 */
export type LoginInput = { email: string; password: string };

export type LoginProblems = { email?: "required" | "email"; password?: "required" };

/** Enough to catch typos; the server decides whether the account exists. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkLogin({ email, password }: LoginInput): LoginProblems {
  const problems: LoginProblems = {};
  const trimmed = email.trim();
  if (!trimmed) problems.email = "required";
  else if (!EMAIL.test(trimmed)) problems.email = "email";
  if (!password) problems.password = "required";
  return problems;
}

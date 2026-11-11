import { describe, expect, it } from "vitest";
import { loginPathFor, safeNextPath } from "~/features/auth/redirect";

describe("post-sign-in redirect", () => {
  it("keeps same-app paths", () => {
    expect(safeNextPath("/payments?status=FAILED")).toBe("/payments?status=FAILED");
  });

  it.each([null, "", "https://evil.example", "//evil.example", "/login?next=/"])(
    "falls back to Home for %s",
    (next) => {
      expect(safeNextPath(next)).toBe("/");
    },
  );

  it("builds the sign-in URL with the current path and reason", () => {
    const url = new URL("http://localhost/courses/c1?tab=sessions");
    expect(loginPathFor(url, "expired")).toBe(
      "/login?next=%2Fcourses%2Fc1%3Ftab%3Dsessions&reason=expired",
    );
  });
});

describe("sign-in form checks (DSH-AUTH-01)", () => {
  it("asks for both fields and a plausible email", async () => {
    const { checkLogin } = await import("~/features/auth/schema");
    expect(checkLogin({ email: "", password: "" })).toEqual({
      email: "required",
      password: "required",
    });
    expect(checkLogin({ email: "  ", password: "x" })).toEqual({ email: "required" });
    expect(checkLogin({ email: "owner@example", password: "x" })).toEqual({ email: "email" });
    expect(checkLogin({ email: " owner@example.com ", password: "x" })).toEqual({});
  });
});

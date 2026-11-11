import { expect, test } from "@playwright/test";

/** DAC-01 (guard + sign-in) and DAC-09 (language and direction) against the mock API. */
test.describe("sign-in and shell", () => {
  test("redirects to sign-in, then returns to the requested page", async ({ page }) => {
    await page.goto("/payments");
    await expect(page).toHaveURL(/\/login\?next=%2Fpayments/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.getByLabel("البريد الإلكتروني").fill("owner@example.com");
    await page.getByLabel("كلمة المرور", { exact: true }).fill("dashboard-demo");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page).toHaveURL("/payments");
    await expect(page.getByRole("heading", { level: 1, name: "المدفوعات" })).toBeVisible();
  });

  test("switches to English and left-to-right", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("radio", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
  });

  test("DSH-AUTH-05: a 401 mid-session explains it and keeps the way back", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.setItem("dashboard.locale", "en"));
    await page.reload();
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Password", { exact: true }).fill("dashboard-demo");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");

    await page.goto("/students?status=ALL");
    await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();

    // The server ends the session behind the app's back (idle or absolute timeout)...
    await page.evaluate(() =>
      fetch("http://localhost:3000/api/v1/admin/auth/logout", {
        method: "POST",
        headers: { "X-Requested-With": "dashboard" },
      }),
    );
    // ...and the next request (here: refetch on focus, DSH-GEN-11) answers 401.
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    await expect(page).toHaveURL(/\/login\?.*reason=expired/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/students?status=ALL");
    await expect(page.getByText("Your session has ended. Sign in again.")).toBeVisible();

    // Signing in again returns to the same page and filters.
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Password", { exact: true }).fill("dashboard-demo");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/students?status=ALL");
    await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();
  });

  test("shows one message for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill("owner@example.com");
    await page.getByLabel("كلمة المرور", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
    await expect(page.getByRole("alert")).toHaveText("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  });
});

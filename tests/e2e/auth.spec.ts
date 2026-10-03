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

  test("shows one message for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill("owner@example.com");
    await page.getByLabel("كلمة المرور", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
    await expect(page.getByRole("alert")).toHaveText("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  });
});

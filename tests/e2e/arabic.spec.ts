import { expect, test, type Page } from "@playwright/test";

/**
 * The core flows again in Arabic (RTL, the default language): copy, field errors and dialogs
 * work end to end, not only in English. DAC-01 and DAC-09 run in Arabic in their own specs;
 * axe and DAC-10 scan both languages.
 */
async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill("owner@example.com");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("dashboard-demo");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
}

test.describe("Arabic (RTL)", () => {
  test("DAC-04: record a refund", async ({ page, isMobile }) => {
    await signIn(page);
    await page.getByRole("link", { name: /حجزان يحتاجان قرار استرداد/ }).click();
    await expect(page).toHaveURL(/needsAction=true/);
    const main = page.getByRole("main");
    const rows = isMobile ? main.locator("ul > li > button") : main.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    if (isMobile) await rows.first().click();
    else await rows.first().getByRole("button").first().click();

    const sheet = page.getByRole("dialog").first();
    await sheet.getByRole("button", { name: "تسجيل استرداد" }).click();
    const refund = page.getByRole("dialog", { name: "تسجيل استرداد" });
    await refund.getByRole("button", { name: "تسجيل الاسترداد" }).click();
    await expect(refund.getByText("أدخل رقم معاملة الاسترداد من Paymob.")).toBeVisible();
    await refund.getByLabel(/رقم معاملة الاسترداد في Paymob/).fill("261234567");
    await refund.getByRole("button", { name: "تسجيل الاسترداد" }).click();
    await expect(refund).toBeHidden();
    await expect(sheet.getByText("مُسترد").first()).toBeVisible();
    await sheet.getByRole("button", { name: "إغلاق" }).click();
    await expect(rows).toHaveCount(1);
  });

  test("DAC-05: search by phone, term not in the URL", async ({ page }) => {
    await signIn(page);
    await page.goto("/students");
    await expect(page.getByRole("heading", { level: 1, name: "الطلاب" })).toBeVisible();
    const search = page
      .getByRole("searchbox", { name: "البحث في التسجيلات" })
      .locator("visible=true");
    await search.fill("01099999999");
    await expect(page.getByText("لا تسجيلات تطابق هذه الفلاتر")).toBeVisible();
    expect(page.url()).not.toContain("1099999999");
  });

  test("DAC-07: a phone used by another assistant is refused on the field", async ({ page }) => {
    await signIn(page);
    await page.goto("/assistants?new=1");
    const dialog = page.getByRole("dialog", { name: "إضافة مساعد" });
    await dialog.getByLabel("الاسم بالكامل").fill("سمير فتحي");
    await dialog.getByLabel("رقم الموبايل").fill("010 0123 4567");
    await dialog.getByRole("button", { name: "إضافة المساعد" }).click();
    await expect(dialog.getByText("رقم الهاتف هذا مستخدم بالفعل لمساعد آخر.")).toBeVisible();
    // The phone input stays left-to-right inside the RTL dialog.
    await expect(dialog.getByLabel("رقم الموبايل")).toHaveAttribute("dir", "ltr");
  });
});

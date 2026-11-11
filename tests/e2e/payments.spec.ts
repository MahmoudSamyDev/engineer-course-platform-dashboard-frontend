import { expect, test, type Locator, type Page } from "@playwright/test";

/** Signs in and switches the UI to English (the mock accounts default to Arabic). */
async function signIn(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("dashboard.locale", "en"));
  await page.reload();
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password", { exact: true }).fill("dashboard-demo");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
}

/** Result rows: table rows on desktop, stacked buttons on phones (DAC-10). */
function resultRows(page: Page, isMobile: boolean): Locator {
  const main = page.getByRole("main");
  return isMobile ? main.locator("ul > li > button") : main.locator("tbody tr");
}

test.describe("payments", () => {
  test("DAC-04: a refund-required booking is listed, then resolved by recording a refund", async ({
    page,
    isMobile,
  }) => {
    await signIn(page);

    // Home lists it under Needs action and links to the filtered payments.
    await page.getByRole("link", { name: /2 bookings need a refund decision/ }).click();
    await expect(page).toHaveURL(/\/payments\?needsAction=true/);
    const rows = resultRows(page, isMobile);
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("Refund required");

    // Open the first one: Move and Refund are offered, Cancel is not.
    if (isMobile) await rows.first().click();
    else await rows.first().getByRole("button").first().click();
    const sheet = page.getByRole("dialog").first();
    await expect(sheet.getByRole("button", { name: "Move to another session" })).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
    await sheet.getByRole("button", { name: "Record refund" }).click();

    // The transaction ID is required before anything is recorded.
    const refund = page.getByRole("dialog", { name: "Record refund" });
    await refund.getByRole("button", { name: "Record refund" }).click();
    await expect(refund.getByText("Enter the refund transaction ID from Paymob.")).toBeVisible();

    await refund.getByLabel(/Paymob refund transaction ID/).fill("261234567");
    await refund.getByRole("button", { name: "Record refund" }).click();
    await expect(refund).toBeHidden();
    await expect(page.getByText("Refund recorded").first()).toBeVisible();

    // Payment and booking are Refunded; no money actions remain.
    await expect(sheet.getByText("Refunded").first()).toBeVisible();
    await expect(sheet.getByText("Refund required")).toHaveCount(0);
    await expect(sheet.getByRole("button", { name: "Record refund" })).toHaveCount(0);
    await expect(sheet.getByText("Refund recorded")).toBeVisible(); // History entry.

    // It leaves Needs action.
    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(sheet).toBeHidden();
    await expect(rows).toHaveCount(1);
    // On phones the quick filter lives in the Filters panel; the count is the same.
    if (!isMobile)
      await expect(page.getByRole("button", { name: "Needs action (1)" })).toBeVisible();
  });

  test("cancelling a paid booking needs a reason", async ({ page, isMobile }) => {
    await signIn(page);
    await page.goto("/payments?status=SUCCEEDED");
    const rows = resultRows(page, isMobile);
    const paid = rows.filter({ hasNotText: /Refund|Cancelled/ }).first();
    if (isMobile) await paid.click();
    else await paid.getByRole("button").first().click();

    const sheet = page.getByRole("dialog").first();
    await sheet.getByRole("button", { name: "Cancel booking" }).click();
    const confirm = page.getByRole("alertdialog", { name: "Cancel this booking?" });
    await confirm.getByRole("button", { name: "Cancel booking" }).click();
    await expect(confirm.getByText("Give a reason for the cancellation.")).toBeVisible();

    await confirm.getByLabel(/Reason/).fill("Student withdrew.");
    await confirm.getByRole("button", { name: "Cancel booking" }).click();
    await expect(confirm).toBeHidden();
    await expect(sheet.getByText("Cancelled").first()).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  });
});

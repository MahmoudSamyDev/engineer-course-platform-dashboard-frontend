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

function resultRows(page: Page, isMobile: boolean): Locator {
  const main = page.getByRole("main");
  return isMobile ? main.locator("ul > li") : main.locator("tbody tr");
}

/** The search box (the filter bar renders one per layout; only one is visible). */
function search(page: Page): Locator {
  return page.getByRole("searchbox", { name: "Search registrations" }).locator("visible=true");
}

test.describe("students", () => {
  test("DAC-05: find a student by phone; the search term stays out of the URL", async ({
    page,
    isMobile,
  }) => {
    await signIn(page);
    await page.goto("/students");
    const rows = resultRows(page, isMobile);
    await expect(rows.first()).toBeVisible();

    // Take a real student's phone from their page, typed the way they'd say it.
    const name = (await rows.first().getByRole("link").first().innerText()).split("\n")[0]!.trim();
    await rows.first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/students\/[^/?]+$/);
    const phone = page
      .locator("bdi[dir=ltr]")
      .filter({ hasText: /^\+?[\d ]{11,}$/ })
      .first();
    const shown = (await phone.textContent())!;
    const digits = shown.replace(/\D/g, "").replace(/^20/, "0");
    expect(digits).toMatch(/^01\d{9}$/);
    // The student page shows the booking and its ticket status.
    await expect(
      page.getByText(/^(Valid|Checked in|Used|Expired|Cancelled)$/).first(),
    ).toBeVisible();

    await page.goto("/students?status=ALL");
    await search(page).fill(digits);
    await expect(rows.filter({ hasNotText: name })).toHaveCount(0);
    await expect(rows.filter({ hasText: name }).first()).toBeVisible();
    await expect(rows.first()).toContainText(/Paid|Refund required|Cancelled|Refunded/);
    expect(page.url()).not.toContain(digits.slice(1));
  });

  test("an unknown phone shows the no-results state", async ({ page }) => {
    await signIn(page);
    await page.goto("/students");
    await search(page).fill("01099999999");
    await expect(page.getByText("No registrations match these filters")).toBeVisible();
  });
});

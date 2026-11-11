import { expect, test, type Page } from "@playwright/test";

/** Signs in with the account's saved language (the mock accounts default to Arabic). */
async function signInArabic(page: Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill("owner@example.com");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("dashboard-demo");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("/");
}

test.describe("DAC-09 — language and direction", () => {
  test("switching keeps the page and filters, and is remembered on next sign-in", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "The account menu (sign-out) is in the rail; the phone drawer is covered in DAC-10.",
    );
    await signInArabic(page);
    await page.goto("/students?status=ALL&range=last30");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: "الطلاب" })).toBeVisible();

    await page.getByRole("radio", { name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Students" })).toBeVisible();
    await expect(page).toHaveURL("/students?status=ALL&range=last30");

    // Sign out and back in: the sign-in page says so, and the account keeps English.
    // (No reload: the in-browser mock would forget the saved language. The "stored choice vs
    // account" rule is covered in login.test.tsx.)
    await page.getByRole("button", { name: /Account menu/ }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login?reason=signed-out");
    await expect(page.getByText("You're signed out.")).toBeVisible();
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Password", { exact: true }).fill("dashboard-demo");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1, name: "Home" })).toBeVisible();
  });
});

/** Every signed-in page, plus the views that open a dialog or sheet. */
const PAGES: Array<{ name: string; path: string; overlay?: "dialog" | "sheet" }> = [
  { name: "home", path: "/" },
  { name: "students", path: "/students" },
  { name: "payments", path: "/payments" },
  { name: "payment sheet", path: "/payments?needsAction=true", overlay: "sheet" },
  { name: "courses", path: "/courses" },
  { name: "course", path: "/courses/C1" },
  { name: "course sessions", path: "/courses/C1?tab=sessions" },
  { name: "session roster", path: "/courses/C1/sessions/ETB-2610-B" },
  { name: "assistants", path: "/assistants" },
  { name: "add assistant", path: "/assistants?new=1", overlay: "dialog" },
  { name: "messages", path: "/messages" },
  { name: "message", path: "/messages?message=msg_001", overlay: "sheet" },
  { name: "profile", path: "/profile" },
  { name: "profile journey", path: "/profile?tab=journey" },
  { name: "profile account", path: "/profile?tab=account" },
];

test.describe("DAC-10 — mobile at 360 px", () => {
  test.use({ viewport: { width: 360, height: 760 } });

  for (const locale of ["ar", "en"] as const) {
    test(`every page fits without sideways scroll (${locale})`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Runs once, in the mobile project.");
      test.setTimeout(90_000);
      await page.goto("/login");
      await page.evaluate((l) => localStorage.setItem("dashboard.locale", l), locale);
      await page.reload();
      await page.locator("input[type=email]").fill("owner@example.com");
      await page.locator("input[type=password]").fill("dashboard-demo");
      await page.locator("button[type=submit]").click();
      await page.waitForURL("/");

      for (const { name, path, overlay } of PAGES) {
        await page.goto(path);
        await expect(page.locator("h1").first(), name).toBeVisible();
        await page.waitForLoadState("networkidle");

        if (name === "payment sheet") {
          // Open the first row (stacked rows on phones, DAC-10).
          await page.getByRole("main").locator("ul > li > button").first().click();
        }
        if (overlay) {
          const panel = page.getByRole("dialog").first();
          await expect(panel, name).toBeVisible();
          // Measure after the slide-in animation.
          await panel.evaluate((el) =>
            Promise.allSettled(el.getAnimations().map((a) => a.finished)),
          );
          const box = (await panel.boundingBox())!;
          expect(box.x, `${name}: dialog starts on screen`).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, `${name}: dialog fits`).toBeLessThanOrEqual(360);
          // Its actions are reachable: the last button in the panel can be scrolled into view.
          const action = panel.getByRole("button").last();
          await action.scrollIntoViewIfNeeded();
          await expect(action, `${name}: action reachable`).toBeInViewport();
        }

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${name} (${locale}) scrolls sideways`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("phone navigation: drawer opens, lists every page, and closes", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Runs once, in the mobile project.");
    await page.goto("/login");
    await page.evaluate(() => localStorage.setItem("dashboard.locale", "en"));
    await page.reload();
    await page.locator("input[type=email]").fill("owner@example.com");
    await page.locator("input[type=password]").fill("dashboard-demo");
    await page.locator("button[type=submit]").click();
    await page.waitForURL("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog");
    for (const label of [
      "Home",
      "Students",
      "Payments",
      "Courses",
      "Assistants",
      "Messages",
      "Profile",
    ])
      await expect(drawer.getByRole("link", { name: new RegExp(`^${label}`) })).toBeVisible();
    await drawer.getByRole("link", { name: /^Payments/ }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL("/payments");
  });
});

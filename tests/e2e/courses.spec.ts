import { expect, test, type Page } from "@playwright/test";

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

/** A date `days` from today as YYYY-MM-DD, for the meeting date input. */
function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

test.describe("courses and sessions", () => {
  test("DAC-02: a new course can't be published until it's complete, then becomes bookable", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/courses");

    // Create the draft from the essentials dialog.
    await page.getByRole("button", { name: "Add course" }).click();
    const dialog = page.getByRole("dialog", { name: "Add course" });
    await dialog.getByLabel("Arabic").first().fill("دورة اختبار");
    await dialog.getByLabel("English").first().fill("Test Course E2E");
    await dialog.getByLabel("Course code").fill("TST");
    await dialog.getByLabel("Base price").fill("1500");
    await dialog.getByLabel("Total hours").fill("12");
    await dialog.getByLabel("Meetings").fill("3");
    const shortDescription = dialog.getByRole("group", { name: /Short description/ });
    await shortDescription.getByLabel("Arabic").fill("وصف مختصر للدورة");
    await shortDescription.getByLabel("English").fill("A short description for the test course.");
    await dialog.getByRole("button", { name: "Create draft" }).click();

    // Lands on the course page as a draft.
    await expect(page.getByRole("heading", { level: 1, name: "Test Course E2E" })).toBeVisible();
    await expect(page.getByText("Draft", { exact: true })).toBeVisible();

    // Publishing is blocked and the missing items are listed.
    await page.getByRole("tab", { name: "Publishing" }).click();
    await expect(page.getByRole("heading", { name: /things are missing/ })).toBeVisible();
    await expect(page.getByText("About the course in both languages")).toBeVisible();
    await expect(page.getByRole("button", { name: "Publish course" })).toBeDisabled();

    // Fill the content the checklist asks for.
    await page.getByRole("tab", { name: "Content" }).click();
    const about = page.getByRole("group", { name: /About the course/ });
    await about.getByLabel("Arabic").fill("نص تجريبي عن الدورة");
    await about.getByLabel("English").fill("Test content about the course");
    const outcomes = page.getByRole("group", { name: /Outcomes/ });
    await outcomes.getByLabel("Arabic").fill("مخرج ١\nمخرج ٢\nمخرج ٣");
    await outcomes.getByLabel("English").fill("Outcome one\nOutcome two\nOutcome three");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved").first()).toBeVisible();

    // One curriculum module.
    await page.getByRole("tab", { name: "Curriculum" }).click();
    await page.getByRole("button", { name: "Add module" }).click();
    const module = page.getByRole("group", { name: /Module title/ });
    await module.getByLabel("Arabic").fill("الوحدة الأولى");
    await module.getByLabel("English").fill("First module");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved").first()).toBeVisible();

    // Add a session so students can actually book it.
    await page.getByRole("tab", { name: "Sessions" }).click();
    await page.getByRole("button", { name: "Add session" }).click();
    const sessionDialog = page.getByRole("dialog", { name: "Add session" });
    await sessionDialog.getByLabel("Location").click();
    await page.getByRole("option").first().click();
    await sessionDialog.getByLabel("Date of meeting 1").fill(futureDate(30));
    await sessionDialog.getByRole("button", { name: "Create session" }).click();
    await expect(page.getByText("Session created").first()).toBeVisible();

    // Now publishing is allowed.
    await page.getByRole("tab", { name: "Publishing" }).click();
    await expect(page.getByRole("heading", { name: "Ready to publish" })).toBeVisible();
    await page.getByRole("button", { name: "Publish course" }).click();
    await expect(page.getByText("Course published").first()).toBeVisible();
  });

  test("DAC-03: capacity can't go below the seats already sold", async ({ page }) => {
    await signIn(page);
    await page.goto("/courses/C1?tab=sessions");

    await page.getByRole("button", { name: /More actions: ETB-2610-A/ }).click();
    await page.getByRole("menuitem", { name: "Edit session" }).click();

    const dialog = page.getByRole("dialog", { name: /Edit session/ });
    await dialog.getByLabel("Seats").fill("2");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    await expect(dialog.getByText(/Capacity can't be less than/)).toBeVisible();
  });

  test("DAC-06: attendance can be marked and undone for a meeting that started", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/courses/C1/sessions/ETB-2608-A");
    await expect(page.getByRole("heading", { name: "Roster" })).toBeVisible();

    // The first "mark attended" button belongs to a student who missed that meeting.
    const mark = page.getByRole("button", { name: /Mark .* attended for meeting/ }).first();
    const studentName = (await mark.textContent())!.match(/Mark (.+) attended for meeting/)![1]!;
    await mark.click();
    await expect(page.getByText("Attendance recorded").first()).toBeVisible();

    // It becomes a ✓ that can be undone, with a confirmation naming the student.
    const undo = page
      .getByRole("button", { name: new RegExp(`Undo attendance for ${studentName}`) })
      .first();
    await undo.click();
    await expect(page.getByRole("alertdialog")).toContainText(studentName);
    await page.getByRole("button", { name: "Undo attendance" }).click();
    await expect(page.getByText("Attendance undone").first()).toBeVisible();
  });
});

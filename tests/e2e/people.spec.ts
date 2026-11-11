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

test.describe("assistants and profile", () => {
  test("DAC-07: duplicate phone, and an assistant with history can only be deactivated", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/assistants");
    await expect(page.getByRole("heading", { level: 1, name: "Assistants" })).toBeVisible();

    // Adding someone with a phone another assistant uses is refused on the field.
    await page.getByRole("button", { name: "Add assistant" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Add assistant" });
    await dialog.getByLabel("Full name").fill("Samir Fathy");
    await dialog.getByLabel("Mobile number").fill("010 0123 4567");
    await dialog.getByRole("button", { name: "Add assistant" }).click();
    await expect(
      dialog.getByText("This phone number is already used by another assistant."),
    ).toBeVisible();

    // A new number works and the card appears.
    await dialog.getByLabel("Mobile number").fill("0115 123 4567");
    await dialog.getByRole("button", { name: "Add assistant" }).click();
    await expect(dialog).toBeHidden();
    const samir = page.getByRole("article").filter({ hasText: "Samir Fathy" });
    await expect(samir).toBeVisible();

    // Mona has check-ins: Delete is not offered, deactivation keeps her history.
    const mona = page.getByRole("article").filter({ hasText: "Mona Samir" });
    await mona.getByRole("button", { name: "More actions: Mona Samir" }).click();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveCount(0);
    await page.getByRole("menuitem", { name: "Deactivate" }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm).toContainText("stay in the attendance history");
    await confirm.getByRole("button", { name: "Deactivate" }).click();
    await expect(mona).toBeHidden(); // Leaves the default "Active" list.

    await page.getByRole("button", { name: "Inactive" }).click();
    await expect(
      page.getByRole("article").filter({ hasText: "Mona Samir" }).getByText("Inactive"),
    ).toBeVisible();

    // The new assistant has no history, so it can be deleted.
    await page.getByRole("button", { name: "Active", exact: true }).click();
    await samir.getByRole("button", { name: "More actions: Samir Fathy" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
    await expect(samir).toBeHidden();
  });

  test("DAC-08 (mock): a changed title is saved, and tabs guard unsaved changes", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { level: 1, name: "Profile" })).toBeVisible();

    const title = page.getByRole("group", { name: /^Title/ });
    await title.getByLabel("English").fill("Principal Structural Engineer");

    // Switching tab with unsaved changes asks first; keeping editing stays on the tab.
    await page.getByRole("tab", { name: "Contact" }).click();
    const guard = page.getByRole("alertdialog", { name: "Discard your changes?" });
    await expect(guard).toBeVisible();
    await guard.getByRole("button", { name: "Cancel" }).click();
    await expect(title.getByLabel("English")).toHaveValue("Principal Structural Engineer");

    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved").first()).toBeVisible();

    // Another tab and back: the saved value comes from the API.
    await page.getByRole("tab", { name: "Stats" }).click();
    await expect(page.getByText(/Use only true numbers/)).toBeVisible();
    await page.getByRole("tab", { name: "Personal" }).click();
    await expect(page.getByRole("group", { name: /^Title/ }).getByLabel("English")).toHaveValue(
      "Principal Structural Engineer",
    );
  });

  test("journey: an end year before the start is explained", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile?tab=journey");
    const first = page.getByRole("listitem").filter({ hasText: "Milestone 1" });
    await first.getByLabel("Start year").fill("2015");
    await first.getByLabel("End year").fill("2010");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(first.getByText("The end year can't be before the start year.")).toBeVisible();
  });
});

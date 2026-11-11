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

test.describe("messages", () => {
  test("DUS-25: read a message, reply links, and the new count drops", async ({ page }) => {
    await signIn(page);

    // Home's Needs action links to the inbox.
    await page.getByRole("link", { name: /4 new messages/ }).click();
    await expect(page).toHaveURL("/messages");
    const inboxTab = page.getByRole("button", { name: /^Inbox/ });
    await expect(inboxTab).toHaveAccessibleName(/4 new messages/);

    // Opening a new message shows it in full and marks it read.
    await page.getByRole("button", { name: /Mariam Fathy/ }).click();
    const sheet = page.getByRole("dialog", { name: "Mariam Fathy" });
    await expect(sheet).toContainText("I didn't receive the email with the ticket");
    await expect(sheet.getByText("Read", { exact: true })).toBeVisible();

    // Reply by email has the subject filled in; no WhatsApp without a phone.
    await expect(sheet.getByRole("link", { name: "Reply by email" })).toHaveAttribute(
      "href",
      "mailto:mariam.fathy@outlook.com?subject=Re%3A%20Booking%20help",
    );
    await expect(sheet.getByRole("link", { name: "Reply on WhatsApp" })).toHaveCount(0);

    // An Arabic sender gets an Arabic subject line and a WhatsApp link.
    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(inboxTab).toHaveAccessibleName(/3 new messages/);
    await page.getByRole("button", { name: /يوسف عادل/ }).click();
    const youssef = page.getByRole("dialog", { name: "يوسف عادل" });
    await expect(youssef.getByRole("link", { name: "Reply by email" })).toHaveAttribute(
      "href",
      /subject=%D8%B1%D8%AF/, // "رد"
    );
    await expect(youssef.getByRole("link", { name: "Reply on WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/201012223344",
    );
    await youssef.getByRole("button", { name: "Close" }).click();
    await expect(inboxTab).toHaveAccessibleName(/2 new messages/);
  });

  test("archive, unarchive and mark as new", async ({ page }) => {
    await signIn(page);
    await page.goto("/messages");

    // Archive: it leaves the inbox and appears under Archived.
    await page.getByRole("button", { name: /Ahmed Elsayed/ }).click();
    await page
      .getByRole("dialog", { name: "Ahmed Elsayed" })
      .getByRole("button", { name: "Archive" })
      .click();
    await expect(page.getByText("Message archived").first()).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Ahmed Elsayed" })).toBeHidden();
    await expect(page.getByRole("button", { name: /Ahmed Elsayed/ })).toHaveCount(0);

    await page.getByRole("button", { name: /^Archived/ }).click();
    await expect(page).toHaveURL("/messages?tab=archived");
    await page.getByRole("button", { name: /Ahmed Elsayed/ }).click();
    await page
      .getByRole("dialog", { name: "Ahmed Elsayed" })
      .getByRole("button", { name: "Move to inbox" })
      .click();
    await expect(page.getByRole("button", { name: /Ahmed Elsayed/ })).toHaveCount(0);

    // Mark as new: the inbox count goes back up.
    await page.getByRole("button", { name: /^Inbox/ }).click();
    const inboxTab = page.getByRole("button", { name: /^Inbox/ });
    await expect(inboxTab).toHaveAccessibleName(/3 new messages/); // Ahmed was read on opening.
    await page.getByRole("button", { name: /Omar Hussein/ }).click();
    await page
      .getByRole("dialog", { name: "Omar Hussein" })
      .getByRole("button", { name: "Mark as new" })
      .click();
    await expect(page.getByText("Marked as new").first()).toBeVisible();
    await expect(inboxTab).toHaveAccessibleName(/4 new messages/);
    await expect(page.getByRole("button", { name: /^New: Omar Hussein/ })).toBeVisible();
  });
});

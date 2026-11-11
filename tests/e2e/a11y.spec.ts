import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** WCAG 2.2 A/AA rules (DNFR-A11Y, quality.md §5). */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const VIEWS: Array<{ name: string; path: string; open?: (page: Page) => Promise<void> }> = [
  { name: "home", path: "/" },
  { name: "students", path: "/students" },
  { name: "payments", path: "/payments" },
  {
    name: "payment sheet + refund dialog",
    path: "/payments?needsAction=true",
    open: async (page) => {
      await page
        .getByRole("main")
        .locator("tbody tr button:visible, ul > li > button:visible")
        .first()
        .click();
      await page.getByRole("dialog").getByRole("button").last().waitFor();
    },
  },
  { name: "courses", path: "/courses" },
  { name: "course", path: "/courses/C1" },
  { name: "session roster", path: "/courses/C1/sessions/ETB-2610-B" },
  { name: "assistants", path: "/assistants" },
  { name: "add assistant", path: "/assistants?new=1" },
  { name: "messages", path: "/messages" },
  { name: "message", path: "/messages?message=msg_001" },
  { name: "profile", path: "/profile" },
  { name: "profile account", path: "/profile?tab=account" },
  {
    name: "quick search",
    path: "/",
    open: async (page) => {
      await page.keyboard.press("/");
      await page.getByRole("combobox").fill("KM-26");
      await page.getByRole("option").first().waitFor();
    },
  },
];

async function signIn(page: Page, locale: "ar" | "en") {
  await page.goto("/login");
  await page.evaluate((l) => localStorage.setItem("dashboard.locale", l), locale);
  await page.reload();
  await page.locator("input[type=email]").fill("owner@example.com");
  await page.locator("input[type=password]").fill("dashboard-demo");
  await page.locator("button[type=submit]").click();
  await page.waitForURL("/");
}

for (const locale of ["ar", "en"] as const) {
  test(`axe: no WCAG A/AA violations (${locale})`, async ({ page, isMobile }) => {
    test.skip(isMobile && locale === "ar", "Phone layout is scanned once, in English.");
    test.setTimeout(120_000);

    // The sign-in page first, before a session exists.
    await page.goto("/login");
    await page.evaluate((l) => localStorage.setItem("dashboard.locale", l), locale);
    await page.reload();
    const results: Array<{
      view: string;
      id: string;
      impact: string;
      help: string;
      nodes: string[];
    }> = [];
    const scan = async (view: string) => {
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of violations)
        results.push({
          view,
          id: v.id,
          impact: v.impact ?? "",
          help: v.help,
          nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
        });
    };
    await page.locator("h1").waitFor();
    await scan("login");

    await signIn(page, locale);
    for (const { name, path, open } of VIEWS) {
      await page.goto(path);
      await page.locator("h1").first().waitFor();
      await page.waitForLoadState("networkidle");
      if (open) await open(page);
      // Let dialogs and sheets finish animating in (opacity affects contrast checks).
      await page.evaluate(() =>
        Promise.allSettled(document.getAnimations().map((a) => a.finished)),
      );
      await scan(name);
    }

    if (results.length) console.log("AXE", JSON.stringify(results));
    expect(results, JSON.stringify(results, null, 2)).toEqual([]);
  });
}

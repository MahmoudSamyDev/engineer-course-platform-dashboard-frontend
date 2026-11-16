import { describe, expect, it } from "vitest";
import { websiteCourseUrl, websiteHomeUrl } from "~/lib/website-url";

describe("View on website links (DSH-CRS-06, DSH-PRO-09)", () => {
  it("open the live website in the UI language", () => {
    expect(websiteHomeUrl("ar")).toBe("https://engineer-course-platform-website-fr.vercel.app/ar");
    expect(websiteCourseUrl("etabs-rc-buildings", "en")).toBe(
      "https://engineer-course-platform-website-fr.vercel.app/en/courses/etabs-rc-buildings",
    );
  });
});

import { describe, expect, it } from "vitest";
import { formatAmount, initials } from "~/lib/format";

describe("formatting", () => {
  it("formats piasters as whole EGP with Latin digits", () => {
    expect(formatAmount(320_000)).toBe("3,200");
  });

  it("builds initials without the engineer title", () => {
    expect(initials("Eng. Mahmoud Samy")).toBe("MS");
    expect(initials("م. محمود سامي")).toBe("مس");
    expect(initials("Hany")).toBe("H");
  });
});

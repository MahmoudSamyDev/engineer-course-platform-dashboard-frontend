import { describe, expect, it } from "vitest";
import { formatAmount, initials } from "~/lib/format";

describe("formatting", () => {
  it("formats piasters as whole EGP with Latin digits", () => {
    expect(formatAmount(320_000)).toBe("3,200");
  });

  it("builds initials without the engineer title", () => {
    expect(initials("Eng. Karim Mostafa")).toBe("KM");
    expect(initials("م. كريم مصطفى")).toBe("كم");
    expect(initials("Hany")).toBe("H");
  });
});

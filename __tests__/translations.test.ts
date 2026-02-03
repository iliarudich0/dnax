import { describe, expect, it } from "vitest";
import { translations } from "@/lib/translations";

describe("translations", () => {
  it("contains both locales", () => {
    expect(Object.keys(translations)).toContain("pl");
    expect(Object.keys(translations)).toContain("en");
  });

  it("shares brand name", () => {
    expect(translations.pl.brand.name).toBe(translations.en.brand.name);
  });
});

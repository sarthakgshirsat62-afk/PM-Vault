import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("RICE Prioritization Template")).toBe("rice-prioritization-template");
  });
  it("strips accents and punctuation", () => {
    expect(slugify("  Café — Product/Market Fit!  ")).toBe("cafe-product-market-fit");
  });
  it("expands ampersands", () => {
    expect(slugify("Go-To-Market & Launch")).toBe("go-to-market-and-launch");
  });
  it("respects max length without trailing hyphen", () => {
    const slug = slugify("a".repeat(10) + " " + "b".repeat(10), 12);
    expect(slug).toBe("aaaaaaaaaa-b");
    expect(slugify("aaaaaaaaaa bbbb", 11)).toBe("aaaaaaaaaa");
  });
  it("produces slugs accepted by the database check", () => {
    for (const s of ["API PRD", "0→1 Startup PRD", "North Star Metric (NSM)"]) {
      expect(isValidSlug(slugify(s))).toBe(true);
    }
  });
});

describe("isValidSlug", () => {
  it("rejects bad slugs", () => {
    expect(isValidSlug("Upper")).toBe(false);
    expect(isValidSlug("double--hyphen")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});

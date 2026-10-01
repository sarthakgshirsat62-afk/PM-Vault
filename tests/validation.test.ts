import { describe, expect, it } from "vitest";
import { cleanText, toList, toNameList } from "@/lib/validation/fields";
import { resourceInputSchema } from "@/lib/validation/resource";

const base = {
  title: "RICE Prioritization Framework",
  slug: "",
  short_description: "Score initiatives by Reach, Impact, Confidence and Effort.",
  external_url: "https://www.intercom.com/blog/rice/",
  price_type: "free",
  difficulty: "beginner",
  status: "draft",
};

describe("cleanText", () => {
  it("strips control characters but keeps newlines and tabs", () => {
    expect(cleanText("a\u0000b\u0007c\n\td ")).toBe("abc\n\td");
  });
  it("returns empty string for non-strings", () => {
    expect(cleanText(42)).toBe("");
    expect(cleanText(null)).toBe("");
  });
});

describe("toList", () => {
  it("splits textarea lines, trims bullets and removes duplicates", () => {
    expect(toList("- one\n• two\n\n* one\nthree")).toEqual(["one", "two", "three"]);
  });
  it("splits CSV pipe-separated values", () => {
    expect(toList("a | b|c")).toEqual(["a", "b", "c"]);
  });
  it("caps item count", () => {
    expect(toList(Array.from({ length: 30 }, (_, i) => `item ${i}`).join("\n"))).toHaveLength(20);
  });
});

describe("toNameList", () => {
  it("dedupes case-insensitively and keeps first spelling", () => {
    expect(toNameList("Metrics, metrics, North Star|API")).toEqual(["Metrics", "North Star", "API"]);
  });
});

describe("resourceInputSchema", () => {
  it("accepts a minimal valid draft", () => {
    const r = resourceInputSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.best_for).toEqual([]);
      expect(r.data.editorial_score).toBe(50);
      expect(r.data.featured).toBe(false);
    }
  });

  it("rejects non-http URLs", () => {
    const r = resourceInputSchema.safeParse({ ...base, external_url: "javascript:alert(1)" });
    expect(r.success).toBe(false);
  });

  it("never allows a sponsored Editor's Pick", () => {
    const r = resourceInputSchema.safeParse({ ...base, sponsored: "on", sponsor_name: "Acme", editors_pick: "on" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === "editors_pick")).toBe(true);
  });

  it("requires a sponsor name for sponsored resources", () => {
    const r = resourceInputSchema.safeParse({ ...base, sponsored: "on" });
    expect(r.success).toBe(false);
  });

  it("requires a meaningful description to publish", () => {
    const r = resourceInputSchema.safeParse({ ...base, status: "published", short_description: "Too short" });
    expect(r.success).toBe(false);
  });

  it("clamps an out-of-range editorial score to invalid", () => {
    expect(resourceInputSchema.safeParse({ ...base, editorial_score: "150" }).success).toBe(false);
    expect(resourceInputSchema.safeParse({ ...base, editorial_score: "abc" }).success).toBe(true);
  });

  it("rejects invalid slugs but accepts blank (auto-generate)", () => {
    expect(resourceInputSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
    expect(resourceInputSchema.safeParse({ ...base, slug: "rice" }).success).toBe(true);
  });

  it("rejects malformed term ids", () => {
    expect(resourceInputSchema.safeParse({ ...base, term_ids: ["not-a-uuid"] }).success).toBe(false);
  });
});

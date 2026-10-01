import { describe, expect, it } from "vitest";
import { hasActiveFilters, parseListingParams, toQueryString } from "@/lib/listing-params";

describe("parseListingParams", () => {
  it("parses filters from comma lists and repeated params", () => {
    const p = parseListingParams({
      q: "  prioritize features ",
      type: "templates,frameworks",
      price: ["free", "paid"],
      difficulty: "beginner,expert",
      career_level: "pm",
      product_type: "b2b,saas",
      sort: "newest",
      page: "3",
    });
    expect(p.q).toBe("prioritize features");
    expect(p.types).toEqual(["templates", "frameworks"]);
    expect(p.prices).toEqual(["free", "paid"]);
    expect(p.difficulties).toEqual(["beginner"]);
    expect(p.terms).toEqual({ career_level: ["pm"], product_type: ["b2b", "saas"] });
    expect(p.sort).toBe("newest");
    expect(p.page).toBe(3);
  });

  it("drops unsafe or invalid values", () => {
    const p = parseListingParams({ type: "Robert'); DROP TABLE--", sort: "evil", page: "-4", sub: "../../etc" });
    expect(p.types).toEqual([]);
    expect(p.sort).toBe("relevance");
    expect(p.page).toBe(1);
    expect(p.sub).toBeNull();
  });

  it("truncates very long queries", () => {
    expect(parseListingParams({ q: "x".repeat(500) }).q).toHaveLength(200);
  });
});

describe("toQueryString", () => {
  it("round-trips and omits defaults", () => {
    const p = parseListingParams({ q: "rice", price: "free", career_level: "pm", sort: "relevance", page: "1" });
    expect(toQueryString(p)).toBe("?q=rice&price=free&career_level=pm");
    expect(parseListingParams(Object.fromEntries(new URLSearchParams(toQueryString(p))))).toEqual(p);
  });
  it("returns empty string with no params", () => {
    expect(toQueryString({})).toBe("");
  });
});

describe("hasActiveFilters", () => {
  it("ignores q, sort and page", () => {
    expect(hasActiveFilters(parseListingParams({ q: "x", sort: "newest", page: "2" }))).toBe(false);
    expect(hasActiveFilters(parseListingParams({ format: "notion" }))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { parseBlockConfig, parseTaskLines, taskLines } from "@/lib/homepage-config";

describe("parseTaskLines", () => {
  it("parses label | href | description lines", () => {
    const { items, errors } = parseTaskLines("Write a PRD | /category/prd-templates\nBuild a Roadmap | /category/roadmapping | Pick a format");
    expect(errors).toEqual([]);
    expect(items).toEqual([
      { label: "Write a PRD", href: "/category/prd-templates", description: undefined },
      { label: "Build a Roadmap", href: "/category/roadmapping", description: "Pick a format" },
    ]);
  });
  it("rejects off-site and malformed links", () => {
    const { items, errors } = parseTaskLines("Evil | https://evil.com\nNo link\nProto | //evil.com");
    expect(items).toEqual([]);
    expect(errors).toHaveLength(3);
  });
  it("round-trips through taskLines", () => {
    const text = "A | /a\nB | /b | desc";
    expect(taskLines(parseTaskLines(text).items)).toBe(text);
  });
});

describe("parseBlockConfig", () => {
  it("falls back to safe defaults for bad data", () => {
    const hero = parseBlockConfig("hero", { primary_cta: { label: "Go", href: "https://evil.com" } }) as {
      primary_cta: { href: string };
      search_label: string;
    };
    expect(hero.primary_cta.href).toBe("");
    expect(hero.search_label).toBe("What are you trying to accomplish?");
  });
  it("clamps list limits", () => {
    expect(parseBlockConfig("featured_resources", { limit: 999 })).toMatchObject({ limit: 4 });
    expect(parseBlockConfig("recently_added", { limit: 6 })).toMatchObject({ limit: 6 });
  });
  it("defaults an invalid browse dimension", () => {
    expect(parseBlockConfig("browse_terms", { kind: "nope" })).toEqual({ kind: "career_level" });
  });
  it("tolerates null config", () => {
    expect(parseBlockConfig("popular_tasks", null)).toEqual({ items: [] });
  });
});

import { describe, expect, it } from "vitest";
import { canonicalColumn, parseCsv, parseJson, summarize, validateRows, type ImportLookups } from "@/lib/import";

const lookups = (): ImportLookups => ({
  categories: [{ id: "11111111-1111-4111-8111-111111111111", name: "Prioritization", slug: "prioritization" }],
  subcategories: [
    { id: "22222222-2222-4222-8222-222222222222", category_id: "11111111-1111-4111-8111-111111111111", name: "Scoring models", slug: "scoring-models" },
  ],
  types: [{ id: "33333333-3333-4333-8333-333333333333", name: "Framework", plural_name: "Frameworks", slug: "frameworks" }],
  terms: [{ id: "44444444-4444-4444-8444-444444444444", kind: "career_level", name: "PM", slug: "pm" }],
  existingUrls: new Map([["existing.com/page", "Existing Resource"]]),
});

const HEADER = "title,description,url,category,subcategory,resource_type,tags,price_type,difficulty,career_level,best_for";

describe("canonicalColumn", () => {
  it("maps PRD column names and aliases", () => {
    expect(canonicalColumn("Description")).toBe("short_description");
    expect(canonicalColumn("URL")).toBe("external_url");
    expect(canonicalColumn("Resource Type")).toBe("resource_type");
    expect(canonicalColumn("Don't use when")).toBe(null);
    expect(canonicalColumn("dont_use_when")).toBe("avoid_when");
    expect(canonicalColumn("thumbnail")).toBe("thumbnail_url");
  });
});

describe("CSV import validation (PRD §83 journey)", () => {
  const csv = [
    HEADER,
    `RICE,"Score initiatives by reach, impact, confidence and effort.",https://intercom.com/rice,Prioritization,Scoring models,Framework,"Prioritization, Backlog",free,beginner,PM,"Quarterly planning | B2B teams"`,
    `RICE again,Same URL as the first row with tracking params added.,https://www.intercom.com/rice/?utm_source=x,Prioritization,,Framework,,free,beginner,,`,
    `Old one,A resource that is already in the library somewhere.,https://existing.com/page,Prioritization,,Framework,,free,beginner,,`,
    `No URL,Missing the url column value entirely here.,,Prioritization,,Framework,,free,beginner,,`,
    `Bad category,Points at a category that does not exist yet.,https://example.com/x,Pricing,,Framework,,free,beginner,,`,
    `Bad price,Uses a price that is not allowed in the schema.,https://example.com/y,Prioritization,,Framework,,cheap,beginner,,`,
  ].join("\n");

  const { rows, errors } = parseCsv(csv);
  const result = validateRows(rows, lookups());

  it("parses every row", () => {
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(6);
  });

  it("resolves names to ids and lists", () => {
    const first = result[0]!;
    expect(first.status).toBe("valid");
    expect(first.input?.category_id).toBe("11111111-1111-4111-8111-111111111111");
    expect(first.input?.subcategory_id).toBe("22222222-2222-4222-8222-222222222222");
    expect(first.input?.resource_type_id).toBe("33333333-3333-4333-8333-333333333333");
    expect(first.input?.term_ids).toEqual(["44444444-4444-4444-8444-444444444444"]);
    expect(first.input?.tag_names).toEqual(["Prioritization", "Backlog"]);
    expect(first.input?.best_for).toEqual(["Quarterly planning", "B2B teams"]);
  });

  it("always imports as draft", () => {
    expect(result[0]!.input?.status).toBe("draft");
  });

  it("detects duplicates within the file and against the library", () => {
    expect(result[1]!.status).toBe("duplicate");
    expect(result[1]!.messages.join()).toMatch(/row 1/);
    expect(result[2]!.status).toBe("duplicate");
    expect(result[2]!.messages.join()).toMatch(/Existing Resource/);
  });

  it("reports missing URLs, unknown categories and bad enums", () => {
    expect(result[3]!.status).toBe("error");
    expect(result[4]!.status).toBe("error");
    expect(result[4]!.messages.join()).toMatch(/Unknown category/);
    expect(result[5]!.status).toBe("error");
  });

  it("summarizes", () => {
    expect(summarize(result)).toEqual({ total: 6, valid: 1, duplicate: 2, error: 3 });
  });
});

describe("JSON import", () => {
  it("accepts { resources: [...] } with one level of nesting", () => {
    const json = JSON.stringify({
      resources: [
        {
          title: "Kano Model",
          metadata: { url: "https://foldingburritos.com/kano", price: "free", difficulty: "intermediate" },
          editorial: { description: "Classify features by how they affect satisfaction.", best_for: ["Feature triage"] },
          classification: { category: "prioritization", resource_type: "frameworks" },
        },
      ],
    });
    const { rows, errors } = parseJson(json);
    expect(errors).toEqual([]);
    const [row] = validateRows(rows, lookups());
    expect(row!.status).toBe("valid");
    expect(row!.input?.best_for).toEqual(["Feature triage"]);
    expect(row!.input?.difficulty).toBe("intermediate");
  });

  it("rejects malformed JSON and wrong shapes", () => {
    expect(parseJson("{nope").errors[0]).toMatch(/Invalid JSON/);
    expect(parseJson('{"a":1}').errors[0]).toMatch(/array/);
  });
});

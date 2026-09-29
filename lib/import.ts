import Papa from "papaparse";
import { resourceInputSchema, type ResourceInput } from "@/lib/validation/resource";
import { cleanText, fieldErrors, toList, toNameList } from "@/lib/validation/fields";
import { normalizeUrl } from "@/lib/url";
import { slugify } from "@/lib/slug";
import { TAXONOMY_KINDS, type TaxonomyKind } from "@/types/domain";

export const IMPORT_MAX_BYTES = 700 * 1024; // stays under the 1 MB server-action body limit
export const IMPORT_MAX_ROWS = 500;

/** Column name (and aliases) → canonical field. */
const ALIASES: Record<string, string> = {
  title: "title", name: "title", resource_name: "title",
  slug: "slug",
  description: "short_description", short_description: "short_description", summary: "short_description",
  long_description: "long_description", overview: "long_description",
  problem_solved: "problem_solved", problem: "problem_solved",
  url: "external_url", external_url: "external_url", link: "external_url", original_url: "external_url",
  thumbnail: "thumbnail_url", thumbnail_url: "thumbnail_url", image: "thumbnail_url",
  category: "category", subcategory: "subcategory",
  resource_type: "resource_type", type: "resource_type",
  tags: "tags",
  price_type: "price_type", price: "price_type",
  difficulty: "difficulty", level: "difficulty", experience: "difficulty",
  estimated_time: "estimated_time", time: "estimated_time",
  author: "author", organization: "organization", organisation: "organization", source: "organization", publisher: "organization",
  best_for: "best_for", use_when: "use_when", avoid_when: "avoid_when", dont_use_when: "avoid_when",
  how_to_use: "how_to_use", steps: "how_to_use", strengths: "strengths", pros: "strengths",
  limitations: "limitations", cons: "limitations", example_output: "example_output", example: "example_output",
  editorial_score: "editorial_score", score: "editorial_score",
  career_level: "career_level", product_type: "product_type", product_stage: "product_stage", stage: "product_stage",
  company_stage: "company_stage", format: "format", persona: "persona", personas: "persona",
  seo_title: "seo_title", meta_description: "meta_description",
};

export function canonicalColumn(header: string): string | null {
  const key = header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return ALIASES[key] ?? null;
}

export type RawRow = Record<string, unknown>;

export type ParseResult = { rows: RawRow[]; errors: string[]; unknownColumns: string[] };

function mapRow(input: Record<string, unknown>, unknown: Set<string>): RawRow {
  const out: RawRow = {};
  for (const [key, value] of Object.entries(input)) {
    const field = canonicalColumn(key);
    if (!field) {
      if (key.trim()) unknown.add(key.trim());
      continue;
    }
    if (value !== undefined && value !== null && value !== "") out[field] = value;
  }
  return out;
}

export function parseCsv(text: string): ParseResult {
  const unknown = new Set<string>();
  const result = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
  });
  const errors = result.errors.slice(0, 10).map((e) => `CSV row ${(e.row ?? 0) + 2}: ${e.message}`);
  const rows = result.data.map((r) => mapRow(r, unknown));
  return { rows, errors, unknownColumns: [...unknown] };
}

/** Flattens one level of nesting so {metadata:{...}, editorial:{...}} also works. */
function flatten(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, v as Record<string, unknown>);
    else out[k] = v;
  }
  return out;
}

export function parseJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { rows: [], errors: [`Invalid JSON: ${(e as Error).message}`], unknownColumns: [] };
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { resources?: unknown }).resources)
      ? (data as { resources: unknown[] }).resources
      : null;
  if (!list) return { rows: [], errors: ["JSON must be an array of resources or { \"resources\": [...] }."], unknownColumns: [] };
  const unknown = new Set<string>();
  const rows: RawRow[] = [];
  const errors: string[] = [];
  list.forEach((item, i) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`Item ${i + 1}: not an object`);
      rows.push({});
      return;
    }
    rows.push(mapRow(flatten(item as Record<string, unknown>), unknown));
  });
  return { rows, errors, unknownColumns: [...unknown] };
}

// ---- Validation ----------------------------------------------------------------

type Named = { id: string; name: string; slug: string };
export type ImportLookups = {
  categories: Named[];
  subcategories: (Named & { category_id: string })[];
  types: (Named & { plural_name: string })[];
  terms: (Named & { kind: TaxonomyKind })[];
  /** normalized_url → existing resource title */
  existingUrls: Map<string, string>;
};

export type RowStatus = "valid" | "duplicate" | "error";

export type ValidatedRow = {
  index: number;
  title: string;
  url: string;
  status: RowStatus;
  messages: string[];
  warnings: string[];
  input?: ResourceInput;
};

function matchByNameOrSlug<T extends Named>(list: T[], value: string, extra?: (t: T) => string[]): T | undefined {
  const v = value.trim().toLowerCase();
  const s = slugify(value);
  return list.find((x) => x.name.toLowerCase() === v || x.slug === s || (extra?.(x) ?? []).some((e) => e.toLowerCase() === v));
}

/** Validates parsed rows. Rows are always imported as drafts. */
export function validateRows(rows: RawRow[], lookups: ImportLookups): ValidatedRow[] {
  const seen = new Map<string, number>();
  return rows.slice(0, IMPORT_MAX_ROWS).map((raw, index) => {
    const messages: string[] = [];
    const warnings: string[] = [];
    const title = cleanText(raw.title).slice(0, 200);
    const url = cleanText(raw.external_url);

    // Classification lookups.
    let category_id: string | null = null;
    let subcategory_id: string | null = null;
    let resource_type_id: string | null = null;
    const categoryName = cleanText(raw.category);
    if (categoryName) {
      const c = matchByNameOrSlug(lookups.categories, categoryName);
      if (c) category_id = c.id;
      else messages.push(`Unknown category “${categoryName}” — create it first or fix the spelling.`);
    }
    const subName = cleanText(raw.subcategory);
    if (subName) {
      const s = matchByNameOrSlug(lookups.subcategories.filter((x) => x.category_id === category_id), subName);
      if (s) subcategory_id = s.id;
      else warnings.push(`Subcategory “${subName}” not found in that category — left empty.`);
    }
    const typeName = cleanText(raw.resource_type);
    if (typeName) {
      const t = matchByNameOrSlug(lookups.types, typeName, (x) => [x.plural_name]);
      if (t) resource_type_id = t.id;
      else messages.push(`Unknown resource type “${typeName}”.`);
    }
    const term_ids: string[] = [];
    for (const kind of TAXONOMY_KINDS) {
      for (const name of toNameList(raw[kind])) {
        const t = matchByNameOrSlug(lookups.terms.filter((x) => x.kind === kind), name);
        if (t) term_ids.push(t.id);
        else warnings.push(`Unknown ${kind.replace("_", " ")} “${name}” — skipped.`);
      }
    }

    const candidate = {
      title,
      slug: cleanText(raw.slug),
      short_description: raw.short_description,
      long_description: raw.long_description,
      problem_solved: raw.problem_solved,
      external_url: url,
      thumbnail_url: raw.thumbnail_url,
      resource_type_id,
      category_id,
      subcategory_id,
      price_type: cleanText(raw.price_type).toLowerCase() || "free",
      difficulty: cleanText(raw.difficulty).toLowerCase() || "beginner",
      estimated_time: raw.estimated_time,
      author: raw.author,
      organization: raw.organization,
      best_for: toList(raw.best_for),
      use_when: toList(raw.use_when),
      avoid_when: toList(raw.avoid_when),
      how_to_use: toList(raw.how_to_use),
      strengths: toList(raw.strengths),
      limitations: toList(raw.limitations),
      example_output: raw.example_output,
      editorial_score: raw.editorial_score,
      seo_title: raw.seo_title,
      meta_description: raw.meta_description,
      tag_names: toNameList(raw.tags),
      term_ids: [...new Set(term_ids)],
      status: "draft", // Imports never publish.
    };

    const parsed = resourceInputSchema.safeParse(candidate);
    if (!parsed.success) {
      for (const [field, msg] of Object.entries(fieldErrors(parsed.error))) messages.push(`${field.replace(/_/g, " ")}: ${msg}`);
    }

    // Duplicates: within the file, then against the library.
    let status: RowStatus = messages.length ? "error" : "valid";
    const normalized = normalizeUrl(url);
    if (normalized) {
      const firstRow = seen.get(normalized);
      const existing = lookups.existingUrls.get(normalized);
      if (existing) {
        status = "duplicate";
        messages.push(`Already in the library as “${existing}”.`);
      } else if (firstRow !== undefined) {
        status = "duplicate";
        messages.push(`Same URL as row ${firstRow + 1} in this file.`);
      } else {
        seen.set(normalized, index);
      }
    }

    return {
      index,
      title: title || "(untitled)",
      url,
      status,
      messages,
      warnings,
      input: status === "valid" && parsed.success ? parsed.data : undefined,
    };
  });
}

export function summarize(rows: ValidatedRow[]) {
  return {
    total: rows.length,
    valid: rows.filter((r) => r.status === "valid").length,
    duplicate: rows.filter((r) => r.status === "duplicate").length,
    error: rows.filter((r) => r.status === "error").length,
  };
}

export const CSV_TEMPLATE_COLUMNS = [
  "title", "description", "url", "category", "subcategory", "resource_type", "tags", "price_type", "difficulty",
  "career_level", "product_type", "product_stage", "company_stage", "format", "best_for", "use_when", "avoid_when",
  "how_to_use", "strengths", "limitations", "author", "organization", "estimated_time", "long_description",
  "problem_solved", "thumbnail",
];

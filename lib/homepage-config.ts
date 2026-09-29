import { z } from "zod";
import { TAXONOMY_KINDS, type HomepageBlockType, type TaxonomyKind } from "@/types/domain";
import { safeRelativePath } from "@/lib/url";

/** Same-site links only, so a homepage edit can never point off-site. */
const href = z.string().transform((v) => safeRelativePath(v.trim(), ""));
const link = z.object({ label: z.string().max(60).catch(""), href: href.catch("") });

export const heroConfig = z.object({
  search_label: z.string().max(120).catch("What are you trying to accomplish?"),
  search_placeholder: z.string().max(200).catch("Search resources…"),
  primary_cta: link.catch({ label: "", href: "" }),
  secondary_cta: link.catch({ label: "", href: "" }),
});

export const tasksConfig = z.object({
  items: z
    .array(z.object({ label: z.string().max(60), href, description: z.string().max(160).optional().catch(undefined) }))
    .max(16)
    .catch([]),
});

export const resourceListConfig = z.object({
  limit: z.number().int().min(1).max(12).catch(4),
  resource_ids: z.array(z.guid()).max(12).optional().catch(undefined),
});

export const limitConfig = z.object({ limit: z.number().int().min(1).max(24).catch(8) });

export const browseTermsConfig = z.object({ kind: z.enum(TAXONOMY_KINDS).catch("career_level" as TaxonomyKind) });

export type HeroConfig = z.infer<typeof heroConfig>;
export type TasksConfig = z.infer<typeof tasksConfig>;
export type ResourceListConfig = z.infer<typeof resourceListConfig>;
export type LimitConfig = z.infer<typeof limitConfig>;
export type BrowseTermsConfig = z.infer<typeof browseTermsConfig>;

/** Parses a block's stored config leniently: bad values fall back to defaults. */
export function parseBlockConfig(type: HomepageBlockType, config: unknown) {
  const input = config && typeof config === "object" ? config : {};
  switch (type) {
    case "hero":
      return heroConfig.parse(input);
    case "popular_tasks":
      return tasksConfig.parse(input);
    case "featured_resources":
    case "editors_picks":
      return resourceListConfig.parse(input);
    case "most_popular":
    case "recently_added":
    case "categories":
      return limitConfig.parse(input);
    case "browse_terms":
      return browseTermsConfig.parse(input);
    default:
      return {};
  }
}

/** "Label | /href | optional description" per line → task items. */
export function parseTaskLines(text: string): { items: TasksConfig["items"]; errors: string[] } {
  const items: TasksConfig["items"] = [];
  const errors: string[] = [];
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const [label = "", rawHref = "", description] = line.split("|").map((p) => p.trim());
      const safe = safeRelativePath(rawHref, "");
      if (!label || !safe) {
        errors.push(`Line ${i + 1}: use “Label | /path”. Links must start with “/”.`);
        return;
      }
      items.push({ label: label.slice(0, 60), href: safe, description: description?.slice(0, 160) || undefined });
    });
  return { items: items.slice(0, 16), errors };
}

export function taskLines(items: TasksConfig["items"]): string {
  return items.map((i) => [i.label, i.href, i.description].filter(Boolean).join(" | ")).join("\n");
}

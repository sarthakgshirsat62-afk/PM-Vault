import { z } from "zod";
import { DIFFICULTIES, PRICE_TYPES, RESOURCE_STATUSES } from "@/types/domain";
import {
  checkbox, externalUrl, intInRange, optionalId, optionalText, optionalUrl,
  requiredText, slugField, text, toList, toNameList,
} from "./fields";

const list = z.preprocess((v) => toList(v), z.array(z.string()));

export const resourceInputSchema = z
  .object({
    title: requiredText(200, "Title"),
    slug: slugField,
    short_description: requiredText(300, "Short description"),
    long_description: text(10000),
    problem_solved: text(1000),
    external_url: externalUrl,
    thumbnail_url: optionalUrl,
    thumbnail_alt: optionalText(200),
    resource_type_id: optionalId,
    category_id: optionalId,
    subcategory_id: optionalId,
    price_type: z.enum(PRICE_TYPES, { message: "Choose free, freemium or paid" }),
    difficulty: z.enum(DIFFICULTIES, { message: "Choose a difficulty" }),
    estimated_time: optionalText(100),
    author: optionalText(200),
    organization: optionalText(200),
    best_for: list,
    use_when: list,
    avoid_when: list,
    how_to_use: list,
    strengths: list,
    limitations: list,
    example_output: text(3000),
    featured: checkbox,
    editors_pick: checkbox,
    sponsored: checkbox,
    sponsor_name: optionalText(120),
    affiliate: checkbox,
    seo_title: optionalText(120),
    meta_description: optionalText(300),
    og_image_url: optionalUrl,
    status: z.enum(RESOURCE_STATUSES),
    editorial_score: intInRange(0, 100, 50),
    internal_notes: text(2000),
    tag_names: z.preprocess((v) => toNameList(v), z.array(z.string())),
    term_ids: z.preprocess(
      (v) => (Array.isArray(v) ? v : typeof v === "string" && v ? [v] : []),
      z.array(z.guid()).max(60),
    ),
  })
  .superRefine((r, ctx) => {
    if (r.sponsored && r.editors_pick) {
      ctx.addIssue({ code: "custom", path: ["editors_pick"], message: "A sponsored resource cannot be an Editor's Pick." });
    }
    if (r.sponsored && !r.sponsor_name) {
      ctx.addIssue({ code: "custom", path: ["sponsor_name"], message: "Name the sponsor so the Sponsored label is accurate." });
    }
    if (r.status === "published" && r.short_description.length < 20) {
      ctx.addIssue({ code: "custom", path: ["short_description"], message: "Write a meaningful description before publishing." });
    }
  });

export type ResourceInput = z.infer<typeof resourceInputSchema>;

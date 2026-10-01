import { z } from "zod";
import { TAXONOMY_KINDS } from "@/types/domain";
import { checkbox, intInRange, optionalText, requiredText, slugField, text } from "./fields";

export const categorySchema = z.object({
  name: requiredText(80, "Name"),
  slug: slugField,
  description: text(300),
  editorial_intro: text(5000),
  icon: optionalText(40),
  seo_title: optionalText(120),
  meta_description: optionalText(300),
  display_order: intInRange(-10000, 10000, 0),
  is_published: checkbox,
});

export const subcategorySchema = z.object({
  category_id: z.guid(),
  name: requiredText(80, "Name"),
  slug: slugField,
  description: text(300),
  display_order: intInRange(-10000, 10000, 0),
});

export const resourceTypeSchema = z.object({
  name: requiredText(60, "Name"),
  plural_name: requiredText(60, "Plural name"),
  slug: slugField,
  description: text(500),
  display_order: intInRange(-10000, 10000, 0),
});

export const tagSchema = z.object({
  name: requiredText(60, "Name"),
  slug: slugField,
});

export const termSchema = z.object({
  kind: z.enum(TAXONOMY_KINDS),
  name: requiredText(60, "Name"),
  slug: slugField,
  display_order: intInRange(-10000, 10000, 0),
});

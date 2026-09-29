"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole, ForbiddenError } from "@/lib/auth";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { checkbox, cleanText, fieldErrors, intInRange, optionalText, optionalUrl, requiredText, slugField, text } from "@/lib/validation/fields";
import { parseTaskLines } from "@/lib/homepage-config";
import { revalidatePublicContent } from "@/lib/revalidate";
import { safeRelativePath } from "@/lib/url";
import { slugify } from "@/lib/slug";
import { HOMEPAGE_BLOCK_TYPES, TAXONOMY_KINDS, type HomepageBlockType } from "@/types/domain";
import { deleteRow, saveRow } from "@/services/admin-crud";
import { resolveResourceSlugs } from "@/services/homepage";
import { updateSiteSettings } from "@/services/admin-site";
import { ServiceError } from "@/services/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idFrom = (fd: FormData) => {
  const id = String(fd.get("id") ?? "");
  return UUID.test(id) ? id : null;
};
function message(e: unknown): string {
  if (e instanceof ForbiddenError) return "You don't have permission to do that.";
  if (e instanceof ServiceError) return e.message;
  return "Something went wrong. Please try again.";
}
const str = (fd: FormData, key: string) => cleanText(fd.get(key));
const num = (fd: FormData, key: string, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

// ---- Homepage blocks ------------------------------------------------------------

async function buildBlockConfig(type: HomepageBlockType, fd: FormData): Promise<{ config?: Record<string, unknown>; error?: string }> {
  switch (type) {
    case "hero":
      return {
        config: {
          search_label: str(fd, "search_label").slice(0, 120),
          search_placeholder: str(fd, "search_placeholder").slice(0, 200),
          primary_cta: { label: str(fd, "primary_label").slice(0, 60), href: safeRelativePath(str(fd, "primary_href"), "") },
          secondary_cta: { label: str(fd, "secondary_label").slice(0, 60), href: safeRelativePath(str(fd, "secondary_href"), "") },
        },
      };
    case "popular_tasks": {
      const { items, errors } = parseTaskLines(str(fd, "items"));
      return errors.length ? { error: errors.join(" ") } : { config: { items } };
    }
    case "featured_resources":
    case "editors_picks": {
      const slugs = str(fd, "resource_slugs")
        .split(/[\s,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12);
      const { ids, missing } = await resolveResourceSlugs(slugs);
      if (missing.length) return { error: `Unknown resource slug(s): ${missing.join(", ")}` };
      return { config: { limit: num(fd, "limit", 1, 12, 4), ...(ids.length ? { resource_ids: ids } : {}) } };
    }
    case "most_popular":
    case "recently_added":
    case "categories":
      return { config: { limit: num(fd, "limit", 1, 24, 8) } };
    case "browse_terms": {
      const kind = str(fd, "kind");
      if (!(TAXONOMY_KINDS as readonly string[]).includes(kind)) return { error: "Choose a filter dimension." };
      return { config: { kind } };
    }
    default:
      return { config: {} };
  }
}

export async function saveHomepageBlockAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireRole("admin");
    const type = str(fd, "block_type");
    if (!(HOMEPAGE_BLOCK_TYPES as readonly string[]).includes(type)) return actionError("Unknown block type.");
    const { config, error } = await buildBlockConfig(type as HomepageBlockType, fd);
    if (error || !config) return actionError(error ?? "Invalid settings.");
    const row = {
      block_type: type,
      heading: str(fd, "heading").slice(0, 160),
      subheading: str(fd, "subheading").slice(0, 300),
      position: num(fd, "position", -10000, 10000, 0),
      enabled: fd.get("enabled") === "on",
      config,
    };
    await saveRow("homepage_blocks", row, idFrom(fd));
  } catch (e) {
    return actionError(message(e));
  }
  revalidatePublicContent();
  return actionOk("Homepage updated.");
}

export async function deleteHomepageBlockAction(fd: FormData): Promise<void> {
  await requireRole("admin");
  const id = idFrom(fd);
  if (!id) return;
  await deleteRow("homepage_blocks", id);
  revalidatePublicContent();
  redirect("/admin/homepage");
}

// ---- Navigation -------------------------------------------------------------------

const navSchema = z.object({
  label: requiredText(40, "Label"),
  href: z.preprocess((v) => safeRelativePath(cleanText(v), ""), z.string().min(1, "Links must start with “/”")),
  position: intInRange(-10000, 10000, 0),
  enabled: checkbox,
  highlight: checkbox,
});

export async function saveNavItemAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireRole("admin");
    const parsed = navSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
    await saveRow("nav_items", parsed.data, idFrom(fd));
  } catch (e) {
    return actionError(message(e));
  }
  revalidatePublicContent();
  return actionOk("Navigation saved.");
}

export async function deleteNavItemAction(fd: FormData): Promise<void> {
  await requireRole("admin");
  const id = idFrom(fd);
  if (!id) return;
  await deleteRow("nav_items", id);
  revalidatePublicContent();
  redirect("/admin/navigation");
}

// ---- Content pages ----------------------------------------------------------------

const pageSchema = z.object({
  title: requiredText(120, "Title"),
  slug: slugField,
  body: text(50000),
  meta_description: optionalText(300),
  published: checkbox,
  show_in_footer: checkbox,
});

export async function savePageAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const id = idFrom(fd);
  let savedId: string;
  try {
    await requireRole("admin");
    const parsed = pageSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
    const row = { ...parsed.data, slug: parsed.data.slug || slugify(parsed.data.title) };
    savedId = await saveRow("pages", row, id);
  } catch (e) {
    return actionError(message(e));
  }
  revalidatePublicContent();
  if (!id) redirect(`/admin/pages/${savedId}`);
  return actionOk("Page saved.");
}

export async function deletePageAction(fd: FormData): Promise<void> {
  await requireRole("admin");
  const id = idFrom(fd);
  if (!id) return;
  await deleteRow("pages", id);
  revalidatePublicContent();
  redirect("/admin/pages");
}

// ---- Site settings ----------------------------------------------------------------

const settingsSchema = z.object({
  site_name: requiredText(60, "Site name"),
  tagline: text(160),
  default_meta_description: text(300),
  default_og_image_url: optionalUrl,
  footer_text: text(500),
});

export async function saveSettingsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireRole("admin");
    const parsed = settingsSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
    await updateSiteSettings(parsed.data);
  } catch (e) {
    return actionError(message(e));
  }
  revalidatePublicContent();
  return actionOk("Settings saved.");
}

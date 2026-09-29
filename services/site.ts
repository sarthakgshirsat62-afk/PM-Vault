import "server-only";
import { cache } from "react";
import { publicDb, check } from "./db";
import type { NavItem, Page, SiteSettings } from "@/types/domain";

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "PM Vault",
  tagline: "",
  default_meta_description: "",
  default_og_image_url: null,
  footer_text: "",
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const db = publicDb();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db
    .from("site_settings")
    .select("site_name, tagline, default_meta_description, default_og_image_url, footer_text")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return data as SiteSettings;
});

export const getNavItems = cache(async (): Promise<NavItem[]> => {
  const db = publicDb();
  if (!db) return [];
  const data = check(await db.from("nav_items").select("*").eq("enabled", true).order("position"), "loading navigation");
  return (data ?? []) as NavItem[];
});

export const getFooterPages = cache(async (): Promise<Pick<Page, "slug" | "title">[]> => {
  const db = publicDb();
  if (!db) return [];
  const data = check(
    await db.from("pages").select("slug, title").eq("published", true).eq("show_in_footer", true).order("title"),
    "loading footer pages",
  );
  return (data ?? []) as Pick<Page, "slug" | "title">[];
});

export const getPublishedPage = cache(async (slug: string): Promise<Page | null> => {
  const db = publicDb();
  if (!db) return null;
  const data = check(await db.from("pages").select("*").eq("slug", slug).eq("published", true).maybeSingle(), "loading page");
  return (data as Page | null) ?? null;
});

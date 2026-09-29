import "server-only";
import { userDb, check, ServiceError } from "./db";
import type { NavItem, Page, SiteSettings } from "@/types/domain";

export async function adminGetSettings(): Promise<SiteSettings> {
  const db = await userDb();
  const data = check(
    await db
      .from("site_settings")
      .select("site_name, tagline, default_meta_description, default_og_image_url, footer_text")
      .eq("id", 1)
      .single(),
    "loading settings",
  );
  return data as SiteSettings;
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const db = await userDb();
  const data = check(await db.from("site_settings").update(settings).eq("id", 1).select("id"), "saving settings") as
    | { id: number }[]
    | null;
  if (!data?.length) throw new ServiceError("Settings not saved — admins only.");
}

export async function adminListNavItems(): Promise<NavItem[]> {
  const db = await userDb();
  return (check(await db.from("nav_items").select("*").order("position"), "loading navigation") ?? []) as NavItem[];
}

export async function adminListPages(): Promise<Page[]> {
  const db = await userDb();
  return (check(await db.from("pages").select("*").order("title"), "loading pages") ?? []) as Page[];
}

export async function adminGetPage(id: string): Promise<Page | null> {
  const db = await userDb();
  return (check(await db.from("pages").select("*").eq("id", id).maybeSingle(), "loading page") ?? null) as Page | null;
}

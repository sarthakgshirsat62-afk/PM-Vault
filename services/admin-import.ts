import "server-only";
import { userDb, check } from "./db";
import { saveResource } from "./admin-resources";
import { adminListCategories, adminListSubcategories, adminListTerms, adminListTypes } from "./taxonomy";
import { normalizeUrl } from "@/lib/url";
import type { ImportLookups, RawRow, ValidatedRow } from "@/lib/import";

export async function loadImportLookups(rows: RawRow[]): Promise<ImportLookups> {
  const [categories, subcategories, types, terms] = await Promise.all([
    adminListCategories(),
    adminListSubcategories(),
    adminListTypes(),
    adminListTerms(),
  ]);

  const urls = [...new Set(rows.map((r) => normalizeUrl(String(r.external_url ?? ""))).filter((u): u is string => Boolean(u)))];
  const existingUrls = new Map<string, string>();
  const db = await userDb();
  for (let i = 0; i < urls.length; i += 200) {
    const chunk = urls.slice(i, i + 200);
    const data = check(
      await db.from("resources").select("normalized_url, title").in("normalized_url", chunk),
      "checking duplicates",
    ) as { normalized_url: string; title: string }[] | null;
    for (const r of data ?? []) existingUrls.set(r.normalized_url, r.title);
  }

  return { categories, subcategories, types, terms, existingUrls };
}

export type ImportOutcome = { imported: { title: string; id: string }[]; failed: { title: string; error: string }[] };

/** Saves valid rows one by one as drafts, continuing past individual failures. */
export async function importValidRows(rows: ValidatedRow[], userId: string): Promise<ImportOutcome> {
  const outcome: ImportOutcome = { imported: [], failed: [] };
  for (const row of rows) {
    if (row.status !== "valid" || !row.input) continue;
    try {
      const saved = await saveResource({ ...row.input, status: "draft" }, { userId });
      outcome.imported.push({ title: row.title, id: saved.id });
    } catch (e) {
      outcome.failed.push({ title: row.title, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }
  return outcome;
}

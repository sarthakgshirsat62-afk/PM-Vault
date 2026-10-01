import "server-only";
import { userDb, ServiceError } from "./db";

/** Admin-managed tables writable through the generic helpers (RLS still applies). */
export type AdminTable =
  | "categories"
  | "subcategories"
  | "resource_types"
  | "tags"
  | "taxonomy_terms"
  | "nav_items"
  | "pages"
  | "homepage_blocks";

const FRIENDLY: Record<string, string> = {
  "23505": "That slug or name is already in use. Choose another.",
  "23503": "This item is still referenced by other content.",
  "23514": "One of the values isn't allowed (check the slug format).",
  "42501": "You don't have permission to do that.",
};

function fail(error: { code?: string; message: string }, context: string): never {
  console.error(`[${context}]`, error.message);
  throw new ServiceError(FRIENDLY[error.code ?? ""] ?? `Database error while ${context}.`, error);
}

/** Inserts (no id) or updates (id) a row and returns its id. */
export async function saveRow(table: AdminTable, row: Record<string, unknown>, id?: string | null): Promise<string> {
  const db = await userDb();
  if (id) {
    const { data, error } = await db.from(table).update(row).eq("id", id).select("id");
    if (error) fail(error, `updating ${table}`);
    if (!data?.length) throw new ServiceError("Not saved — the item no longer exists or you lack permission.");
    return id;
  }
  const { data, error } = await db.from(table).insert(row).select("id").single();
  if (error) fail(error, `creating ${table}`);
  return (data as { id: string }).id;
}

export async function deleteRow(table: AdminTable, id: string): Promise<void> {
  const db = await userDb();
  const { data, error } = await db.from(table).delete().eq("id", id).select("id");
  if (error) fail(error, `deleting from ${table}`);
  if (!data?.length) throw new ServiceError("Not deleted — you may lack permission.");
}

"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { requireRole, ForbiddenError } from "@/lib/auth";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { fieldErrors } from "@/lib/validation/fields";
import { categorySchema, resourceTypeSchema, subcategorySchema, tagSchema, termSchema } from "@/lib/validation/taxonomy";
import { revalidatePublicContent } from "@/lib/revalidate";
import { slugify } from "@/lib/slug";
import type { UserRole } from "@/types/domain";
import { deleteRow, saveRow, type AdminTable } from "@/services/admin-crud";
import { ServiceError } from "@/services/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idFrom(formData: FormData): string | null {
  const id = String(formData.get("id") ?? "");
  return UUID.test(id) ? id : null;
}

function message(e: unknown): string {
  if (e instanceof ForbiddenError) return "You don't have permission to do that.";
  if (e instanceof ServiceError) return e.message;
  return "Something went wrong. Please try again.";
}

/**
 * Shared save flow: role check → validate → auto-slug → save → purge cache.
 * `slugFrom` names the field used to generate a slug when none is given.
 */
async function save<S extends z.ZodType<Record<string, unknown>>>(
  formData: FormData,
  opts: { role: UserRole; schema: S; table: AdminTable; slugFrom?: string; redirectTo?: (id: string) => string; ok: string },
): Promise<ActionState> {
  try {
    await requireRole(opts.role);
  } catch (e) {
    return actionError(message(e));
  }
  const parsed = opts.schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const row: Record<string, unknown> = { ...parsed.data };
  if (opts.slugFrom && "slug" in row && !row.slug) {
    row.slug = slugify(String(row[opts.slugFrom] ?? ""));
    if (!row.slug) return actionError("Could not generate a slug — enter one manually.", { slug: "Required" });
  }
  const id = idFrom(formData);
  let savedId: string;
  try {
    savedId = await saveRow(opts.table, row, id);
  } catch (e) {
    return actionError(message(e));
  }
  revalidatePublicContent();
  if (!id && opts.redirectTo) redirect(opts.redirectTo(savedId));
  return actionOk(opts.ok);
}

async function remove(formData: FormData, table: AdminTable, redirectTo: string): Promise<void> {
  await requireRole("admin");
  const id = idFrom(formData);
  if (!id) return;
  await deleteRow(table, id);
  revalidatePublicContent();
  redirect(redirectTo);
}

// ---- Categories ------------------------------------------------------------------
export async function saveCategoryAction(_p: ActionState, fd: FormData) {
  return save(fd, {
    role: "admin", schema: categorySchema, table: "categories", slugFrom: "name",
    redirectTo: (id) => `/admin/categories/${id}?created=1`, ok: "Category saved. Its public page is live at /category/<slug>.",
  });
}
export async function deleteCategoryAction(fd: FormData) {
  await remove(fd, "categories", "/admin/categories?deleted=1");
}

// ---- Subcategories ---------------------------------------------------------------
export async function saveSubcategoryAction(_p: ActionState, fd: FormData) {
  return save(fd, { role: "admin", schema: subcategorySchema, table: "subcategories", slugFrom: "name", ok: "Subcategory saved." });
}
export async function deleteSubcategoryAction(fd: FormData) {
  const categoryId = String(fd.get("category_id") ?? "");
  await remove(fd, "subcategories", UUID.test(categoryId) ? `/admin/categories/${categoryId}` : "/admin/categories");
}

// ---- Resource types --------------------------------------------------------------
export async function saveTypeAction(_p: ActionState, fd: FormData) {
  return save(fd, { role: "admin", schema: resourceTypeSchema, table: "resource_types", slugFrom: "plural_name", ok: "Resource type saved." });
}
export async function deleteTypeAction(fd: FormData) {
  await remove(fd, "resource_types", "/admin/types");
}

// ---- Tags (editors may create/rename; only admins delete) -----------------------
export async function saveTagAction(_p: ActionState, fd: FormData) {
  return save(fd, { role: "editor", schema: tagSchema, table: "tags", slugFrom: "name", ok: "Tag saved." });
}
export async function deleteTagAction(fd: FormData) {
  await remove(fd, "tags", "/admin/tags");
}

// ---- Filter values ---------------------------------------------------------------
export async function saveTermAction(_p: ActionState, fd: FormData) {
  return save(fd, { role: "admin", schema: termSchema, table: "taxonomy_terms", slugFrom: "name", ok: "Filter value saved." });
}
export async function deleteTermAction(fd: FormData) {
  await remove(fd, "taxonomy_terms", "/admin/filters");
}

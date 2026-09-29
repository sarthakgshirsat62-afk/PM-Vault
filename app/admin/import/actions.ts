"use server";

import { requireRole } from "@/lib/auth";
import { IMPORT_MAX_BYTES, IMPORT_MAX_ROWS, parseCsv, parseJson, summarize, validateRows, type ValidatedRow } from "@/lib/import";
import { revalidatePublicContent } from "@/lib/revalidate";
import { importValidRows, loadImportLookups, type ImportOutcome } from "@/services/admin-import";

export type PreviewRow = Omit<ValidatedRow, "input">;

export type ImportPreview = {
  ok: boolean;
  error?: string;
  parseErrors: string[];
  unknownColumns: string[];
  truncated: boolean;
  summary: { total: number; valid: number; duplicate: number; error: number };
  rows: PreviewRow[];
};

type Format = "csv" | "json";

async function analyse(format: Format, text: string) {
  if (typeof text !== "string" || text.length === 0) throw new Error("The file is empty.");
  if (text.length > IMPORT_MAX_BYTES) throw new Error("File is larger than 700 KB. Split it into smaller files.");
  const parsed = format === "json" ? parseJson(text) : parseCsv(text);
  const lookups = await loadImportLookups(parsed.rows);
  const rows = validateRows(parsed.rows, lookups);
  return { parsed, rows, truncated: parsed.rows.length > IMPORT_MAX_ROWS };
}

const EMPTY = { total: 0, valid: 0, duplicate: 0, error: 0 };

/** Step 1: parse + validate + detect duplicates. Writes nothing. */
export async function previewImportAction(format: Format, text: string): Promise<ImportPreview> {
  try {
    await requireRole("editor");
    const { parsed, rows, truncated } = await analyse(format === "json" ? "json" : "csv", text);
    return {
      ok: true,
      parseErrors: parsed.errors,
      unknownColumns: parsed.unknownColumns,
      truncated,
      summary: summarize(rows),
      rows: rows.map(({ input: _input, ...rest }) => {
        void _input;
        return rest;
      }),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not read the file.", parseErrors: [], unknownColumns: [], truncated: false, summary: EMPTY, rows: [] };
  }
}

/**
 * Step 2: re-validate on the server (the client preview is never trusted)
 * and import valid rows as drafts. Nothing is published.
 */
export async function runImportAction(format: Format, text: string): Promise<{ ok: boolean; error?: string; outcome?: ImportOutcome }> {
  try {
    const user = await requireRole("editor");
    const { rows } = await analyse(format === "json" ? "json" : "csv", text);
    const outcome = await importValidRows(rows, user.id);
    revalidatePublicContent();
    return { ok: true, outcome };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed." };
  }
}

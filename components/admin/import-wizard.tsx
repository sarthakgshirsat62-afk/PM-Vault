"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { previewImportAction, runImportAction, type ImportPreview } from "@/app/admin/import/actions";
import type { ImportOutcome } from "@/services/admin-import";

const MAX_BYTES = 700 * 1024;

const STATUS_STYLE = {
  valid: "bg-success-soft text-success",
  duplicate: "bg-pick-soft text-pick",
  error: "bg-danger-soft text-danger",
} as const;

export function ImportWizard() {
  const [file, setFile] = useState<{ name: string; format: "csv" | "json"; text: string } | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(f: File | undefined) {
    setPreview(null);
    setOutcome(null);
    setError(null);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("File is larger than 700 KB. Split it into smaller files.");
      return;
    }
    const format = f.name.toLowerCase().endsWith(".json") ? "json" : "csv";
    const text = await f.text();
    setFile({ name: f.name, format, text });
    startTransition(async () => {
      const result = await previewImportAction(format, text);
      if (!result.ok) setError(result.error ?? "Could not read the file.");
      setPreview(result);
    });
  }

  function onImport() {
    if (!file) return;
    startTransition(async () => {
      const result = await runImportAction(file.format, file.text);
      if (!result.ok || !result.outcome) setError(result.error ?? "Import failed.");
      else setOutcome(result.outcome);
    });
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <label htmlFor="import-file" className="label">
          1. Choose a CSV or JSON file
        </label>
        <input
          id="import-file"
          type="file"
          accept=".csv,.json,text/csv,application/json"
          className="input"
          onChange={(e) => onFile(e.target.files?.[0])}
          disabled={pending}
          aria-describedby="import-hint"
        />
        <p id="import-hint" className="hint">
          Up to 500 rows / 700 KB. Lists use “|” between items (e.g. <code>Startups | B2B teams</code>). Tags and filters accept names
          or slugs, comma- or pipe-separated.
        </p>
      </div>

      <div aria-live="polite">
        {pending && <p className="text-sm text-ink-muted">Working…</p>}
        {error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {outcome && (
        <div role="status" className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">Import complete</h2>
          <p>
            <strong>{outcome.imported.length}</strong> resource{outcome.imported.length === 1 ? "" : "s"} imported as <strong>drafts</strong>.
            {outcome.failed.length > 0 && ` ${outcome.failed.length} failed.`}
          </p>
          {outcome.failed.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-danger">
              {outcome.failed.map((f, i) => (
                <li key={i}>
                  {f.title}: {f.error}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/resources?status=draft" className="btn btn-primary">
            Review drafts & bulk publish
          </Link>
        </div>
      )}

      {preview?.ok && !outcome && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">2. Review</h2>
            <p className="mt-1 text-sm">
              {preview.summary.total} rows · <span className="text-success">{preview.summary.valid} valid</span> ·{" "}
              <span className="text-pick">{preview.summary.duplicate} duplicate</span> ·{" "}
              <span className="text-danger">{preview.summary.error} with errors</span>
            </p>
            {preview.truncated && <p className="mt-1 text-sm text-danger">Only the first 500 rows were read.</p>}
            {preview.unknownColumns.length > 0 && (
              <p className="mt-1 text-sm text-ink-muted">Ignored columns: {preview.unknownColumns.join(", ")}</p>
            )}
            {preview.parseErrors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-danger">
                {preview.parseErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" disabled={pending || preview.summary.valid === 0} onClick={onImport}>
                3. Import {preview.summary.valid} valid row{preview.summary.valid === 1 ? "" : "s"} as drafts
              </button>
              <span className="text-sm text-ink-muted">Duplicates and rows with errors are skipped. Nothing is published.</span>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Import preview</caption>
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
                <tr>
                  <th scope="col" className="p-3">Row</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">Title</th>
                  <th scope="col" className="p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.index} className="border-b border-line align-top last:border-0">
                    <td className="p-3 text-ink-muted">{r.index + 1}</td>
                    <td className="p-3">
                      <span className={`badge ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="max-w-xs truncate text-xs text-ink-subtle">{r.url}</div>
                    </td>
                    <td className="p-3">
                      {[...r.messages.map((m) => ({ m, warn: false })), ...r.warnings.map((m) => ({ m, warn: true }))].map(({ m, warn }, i) => (
                        <div key={i} className={warn ? "text-ink-muted" : r.status === "error" ? "text-danger" : "text-pick"}>
                          {warn ? "Note: " : ""}
                          {m}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

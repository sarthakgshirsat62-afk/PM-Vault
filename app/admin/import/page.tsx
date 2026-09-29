import { AdminPageHeader } from "@/components/admin/page-header";
import { ImportWizard } from "@/components/admin/import-wizard";

export const metadata = { title: "Import" };

export default function ImportPage() {
  return (
    <div>
      <AdminPageHeader
        title="Bulk import"
        description="Upload a CSV or JSON file. You'll see every row validated and checked for duplicates before anything is saved. Imported resources are always drafts."
        actions={
          <a href="/admin/import/template" className="btn btn-secondary" download>
            Download CSV template
          </a>
        }
      />
      <ImportWizard />
      <details className="card mt-8 p-5 text-sm">
        <summary className="cursor-pointer font-semibold">Column reference</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-muted">
          <li>
            <strong>Required:</strong> <code>title</code>, <code>description</code> (one-line value proposition), <code>url</code>.
          </li>
          <li>
            <code>category</code>, <code>subcategory</code>, <code>resource_type</code>: names or slugs that already exist in admin.
          </li>
          <li>
            <code>price_type</code>: free · freemium · paid. <code>difficulty</code>: beginner · intermediate · advanced.
          </li>
          <li>
            Filters: <code>career_level</code>, <code>product_type</code>, <code>product_stage</code>, <code>company_stage</code>,{" "}
            <code>format</code>, <code>persona</code> — names or slugs, comma/pipe separated.
          </li>
          <li>
            Lists: <code>best_for</code>, <code>use_when</code>, <code>avoid_when</code>, <code>how_to_use</code>, <code>strengths</code>,{" "}
            <code>limitations</code> — separate items with “|”.
          </li>
          <li>
            JSON: an array of objects (or <code>{"{ \"resources\": [...] }"}</code>) using the same field names; one level of nesting
            (e.g. <code>metadata</code>, <code>editorial</code>) is flattened.
          </li>
          <li>File contents are treated as data only. Write descriptions in your own words — don&apos;t paste copyrighted text.</li>
        </ul>
      </details>
    </div>
  );
}

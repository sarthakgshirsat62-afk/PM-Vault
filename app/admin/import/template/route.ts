import Papa from "papaparse";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { CSV_TEMPLATE_COLUMNS } from "@/lib/import";

/** Empty CSV template (header row + one illustrative row to overwrite). */
export async function GET() {
  const user = await getSessionUser();
  if (!hasRole(user?.role, "editor")) return new NextResponse("Forbidden", { status: 403 });

  const example: Record<string, string> = {
    title: "Example: Your resource title",
    description: "One sentence, in your own words, on what it helps a PM do.",
    url: "https://example.com/replace-me",
    price_type: "free",
    difficulty: "beginner",
    best_for: "First item | Second item",
  };
  const csv = Papa.unparse({ fields: CSV_TEMPLATE_COLUMNS, data: [CSV_TEMPLATE_COLUMNS.map((c) => example[c] ?? "")] });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pm-vault-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}

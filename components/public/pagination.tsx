import Link from "next/link";
import { toQueryString, type ListingParams } from "@/lib/listing-params";

export function Pagination({ basePath, params, total, pageSize }: { basePath: string; params: ListingParams; total: number; pageSize: number }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const page = Math.min(params.page, pages);
  const href = (p: number) => `${basePath}${toQueryString({ ...params, page: p })}`;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-secondary btn-sm" rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className="btn btn-secondary btn-sm opacity-50" aria-disabled="true">
          ← Previous
        </span>
      )}
      <span aria-current="page">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="btn btn-secondary btn-sm" rel="next">
          Next →
        </Link>
      ) : (
        <span className="btn btn-secondary btn-sm opacity-50" aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}

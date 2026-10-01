import Link from "next/link";
import { SearchForm } from "@/components/public/search-form";

export default function NotFound() {
  return (
    <div className="container-page max-w-xl py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-ink-muted">It may have been moved or unpublished. Try searching instead.</p>
      <div className="mt-8 text-left">
        <SearchForm id="notfound-search" label="Search resources" size="lg" />
      </div>
      <Link href="/" className="btn btn-ghost mt-6">
        Back to home
      </Link>
    </div>
  );
}

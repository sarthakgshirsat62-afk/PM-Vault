import Link from "next/link";
import { getFooterPages, getSiteSettings } from "@/services/site";
import { getPublishedCategories } from "@/services/taxonomy";

export async function SiteFooter() {
  const [settings, pages, categories] = await Promise.all([getSiteSettings(), getFooterPages(), getPublishedCategories()]);

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="font-display text-xl font-semibold">{settings.site_name}</p>
          {settings.tagline && <p className="mt-2 text-sm text-ink-muted">{settings.tagline}</p>}
          <Link href="/submit" className="btn btn-secondary btn-sm mt-4">
            Submit a resource
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {categories.length > 0 && (
            <nav aria-labelledby="footer-categories">
              <h2 id="footer-categories" className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Categories
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
                {categories.slice(0, 12).map((c) => (
                  <li key={c.id}>
                    <Link href={`/category/${c.slug}`} className="text-ink-muted hover:text-ink hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <nav aria-labelledby="footer-about">
            <h2 id="footer-about" className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              About
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link href="/resources" className="text-ink-muted hover:text-ink hover:underline">
                  All resources
                </Link>
              </li>
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="text-ink-muted hover:text-ink hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {settings.footer_text && (
        <div className="border-t border-line">
          <p className="container-page py-5 text-xs text-ink-subtle">{settings.footer_text}</p>
        </div>
      )}
    </footer>
  );
}

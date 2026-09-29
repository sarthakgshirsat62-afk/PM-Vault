import Link from "next/link";
import { getNavItems, getSiteSettings } from "@/services/site";
import { MobileMenu } from "./mobile-menu";
import { SearchForm } from "./search-form";

export async function SiteHeader() {
  const [settings, nav] = await Promise.all([getSiteSettings(), getNavItems()]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="container-page relative flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 font-display text-xl font-semibold tracking-tight">
          {settings.site_name}
        </Link>
        <nav aria-label="Main" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={
                    item.highlight
                      ? "btn btn-secondary btn-sm ml-1"
                      : "rounded-lg px-2.5 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden w-72 md:block">
          <SearchForm id="header-search" label="Search PM resources" placeholder="Search resources…" />
        </div>
        <div className="ml-auto md:ml-0">
          <MobileMenu items={nav} />
        </div>
      </div>
      {/* Search stays prominent on small screens. */}
      <div className="container-page pb-3 md:hidden">
        <SearchForm id="header-search-mobile" label="Search PM resources" placeholder="Search resources…" />
      </div>
    </header>
  );
}

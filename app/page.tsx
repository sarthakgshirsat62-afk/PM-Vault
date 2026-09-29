import type { Metadata } from "next";
import { HomeBlock } from "@/components/public/home-blocks";
import { JsonLd } from "@/components/public/json-ld";
import { SearchForm } from "@/components/public/search-form";
import { websiteSchema } from "@/lib/structured-data";
import { getEnabledHomepageBlocks } from "@/services/homepage";
import { getSiteSettings } from "@/services/site";

// Statically cached; admin edits purge it immediately (see lib/revalidate.ts).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: { absolute: settings.tagline ? `${settings.site_name} — ${settings.tagline}` : settings.site_name },
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [blocks, settings] = await Promise.all([getEnabledHomepageBlocks(), getSiteSettings()]);
  const hasHero = blocks.some((b) => b.block_type === "hero");

  return (
    <>
      <JsonLd data={websiteSchema(settings.site_name, settings.default_meta_description)} />
      {!hasHero && (
        // Minimal fallback so the page always has a heading and search,
        // even before any homepage blocks are configured.
        <section className="container-page py-16 text-center">
          <h1 className="font-display text-4xl font-semibold">{settings.site_name}</h1>
          {settings.tagline && <p className="mt-3 text-lg text-ink-muted">{settings.tagline}</p>}
          <div className="mx-auto mt-8 max-w-2xl text-left">
            <SearchForm id="home-search" label="Search resources" size="lg" />
          </div>
        </section>
      )}
      {blocks.map((block) => (
        <HomeBlock key={block.id} block={block} />
      ))}
    </>
  );
}

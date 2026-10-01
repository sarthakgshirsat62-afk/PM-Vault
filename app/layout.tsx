import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";
import { getSiteSettings } from "@/services/site";
import { HideOnAdmin } from "@/components/public/hide-on-admin";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = settings.default_meta_description || undefined;
  const images = settings.default_og_image_url ? [settings.default_og_image_url] : undefined;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: settings.site_name, template: `%s · ${settings.site_name}` },
    description,
    applicationName: settings.site_name,
    openGraph: { siteName: settings.site_name, type: "website", locale: "en_US", description, images },
    twitter: { card: "summary_large_image", description, images },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#111114" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only-focusable btn btn-primary absolute left-4 top-4 z-50">
          Skip to content
        </a>
        <HideOnAdmin>
          <SiteHeader />
        </HideOnAdmin>
        <main id="main" className="flex-1">
          {children}
        </main>
        <HideOnAdmin>
          <SiteFooter />
        </HideOnAdmin>
      </body>
    </html>
  );
}

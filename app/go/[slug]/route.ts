import { NextResponse, type NextRequest } from "next/server";
import { isValidSlug } from "@/lib/slug";
import { parseExternalUrl } from "@/lib/url";
import { isLikelyBot } from "@/lib/validation/track";
import { getPublishedUrl, recordOutboundClick } from "@/services/analytics";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

/**
 * Tracked outbound redirect: /go/<resource-slug>?from=detail
 * Only published resources resolve; the destination always comes from the
 * database, never from the request, so this can't be used as an open redirect.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/go/[slug]">) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return NextResponse.redirect(new URL("/resources", request.url), { headers: HEADERS });

  const fromDetail = request.nextUrl.searchParams.get("from") === "detail";
  const destination = isLikelyBot(request.headers.get("user-agent"))
    ? await getPublishedUrl(slug)
    : await recordOutboundClick(slug, fromDetail);

  const url = destination ? parseExternalUrl(destination) : null;
  if (!url) return NextResponse.redirect(new URL(`/resource/${slug}`, request.url), { headers: HEADERS });
  return NextResponse.redirect(url, { status: 302, headers: HEADERS });
}

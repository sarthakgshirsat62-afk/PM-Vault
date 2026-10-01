import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { isLikelyBot, trackEventSchema } from "@/lib/validation/track";
import { recordEvent } from "@/services/analytics";

const MAX_BODY_BYTES = 4096;

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Browsers always send Origin on cross-site POSTs; reject foreign ones.
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (isLikelyBot(request.headers.get("user-agent"))) return new NextResponse(null, { status: 204 });

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = trackEventSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  if (!(await checkRateLimit("track", 120, 60))) return new NextResponse(null, { status: 429 });

  const result = await recordEvent(parsed.data);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

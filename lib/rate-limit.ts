import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Opaque, daily-rotating client key. The raw IP is never stored: only a
 * salted SHA-256 hash, which the database deletes after a day.
 */
async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.RATE_LIMIT_SALT ?? "pm-vault";
  return createHash("sha256").update(`${salt}:${day}:${ip}`).digest("hex");
}

/** Returns true when allowed. Fails open if the limiter itself errors. */
export async function checkRateLimit(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: await clientKey(),
    p_bucket: bucket,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.message);
    return true;
  }
  return data === true;
}

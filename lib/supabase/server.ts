import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Per-request client bound to the visitor's auth cookies. Every query runs
 * with the visitor's permissions, so RLS is always enforced.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies are read-only; the
          // proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Cookie-less anonymous client for cacheable public reads (sitemap, static
 * generation). Sees exactly what a logged-out visitor sees.
 */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createPlainClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient, createPublicClient } from "@/lib/supabase/server";

/**
 * Cookie-less anonymous client for public, cacheable reads. Returns null
 * when Supabase isn't configured (e.g. a local build without .env.local),
 * so public pages render an empty state instead of crashing.
 */
export function publicDb() {
  return isSupabaseConfigured() ? createPublicClient() : null;
}

/** Session-bound client: every query runs as the signed-in user (RLS). */
export async function userDb() {
  return createClient();
}

export class ServiceError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "ServiceError";
  }
}

/** Throws a ServiceError (logged server-side) for a failed Supabase call. */
export function check<T>(result: { data: T; error: { message: string } | null }, context: string): T {
  if (result.error) {
    console.error(`[${context}]`, result.error.message);
    throw new ServiceError(`Database error while ${context}.`, result.error);
  }
  return result.data;
}

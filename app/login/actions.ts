"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { safeRelativePath } from "@/lib/url";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({
  email: z.email().max(320),
  next: z.string().max(300).optional(),
});

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email"), next: formData.get("next") ?? undefined });
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };

  if (!(await checkRateLimit("login", 5, 600))) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const next = safeRelativePath(parsed.data.next, "/");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    console.error("magic link failed", error.message);
    return { status: "error", message: "We couldn't send the link. Please try again shortly." };
  }
  return { status: "sent" };
}

import { z } from "zod";
import { normalizeUrl, parseExternalUrl } from "@/lib/url";
import { isValidSlug } from "@/lib/slug";

function isControlChar(code: number): boolean {
  // Keep tab (9), newline (10) and carriage return (13).
  return (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127;
}

/** Trims and strips control characters from user-supplied text. */
export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    if (!isControlChar(ch.charCodeAt(0))) out += ch;
  }
  return out.trim();
}

/** One item per line (textarea) or "|"-separated (CSV) → clean list. */
export function toList(value: unknown, { maxItems = 20, maxLength = 500 } = {}): string[] {
  const raw = Array.isArray(value) ? value.map(String) : cleanText(value).split(/\r?\n|\s*\|\s*/);
  const out: string[] = [];
  for (const item of raw) {
    const text = cleanText(item).replace(/^[-*•]\s+/, "").slice(0, maxLength);
    if (text && !out.includes(text)) out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Comma/pipe/newline separated names → unique (case-insensitive) list. */
export function toNameList(value: unknown, max = 25): string[] {
  const raw = Array.isArray(value) ? value.map(String) : cleanText(value).split(/[,|\n]/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const name = cleanText(item).slice(0, 60);
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
    if (out.length >= max) break;
  }
  return out;
}

export const optionalText = (max: number) =>
  z.preprocess((v) => {
    const s = cleanText(v);
    return s === "" ? null : s;
  }, z.string().max(max).nullable());

export const requiredText = (max: number, label: string) =>
  z.preprocess(cleanText, z.string().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`));

export const text = (max: number) => z.preprocess(cleanText, z.string().max(max));

export const externalUrl = z.preprocess(
  cleanText,
  z.string().max(2000).refine((v) => parseExternalUrl(v) !== null && normalizeUrl(v) !== null, {
    message: "Enter a valid http(s) URL",
  }),
);

export const optionalUrl = z.preprocess(
  (v) => {
    const s = cleanText(v);
    return s === "" ? null : s;
  },
  z.string().max(2000).refine((v) => parseExternalUrl(v) !== null, { message: "Enter a valid http(s) URL" }).nullable(),
);

export const slugField = z.preprocess(
  (v) => cleanText(v).toLowerCase(),
  z.string().max(100).refine((v) => v === "" || isValidSlug(v), {
    message: "Use lowercase letters, numbers and single hyphens",
  }),
);

export const optionalId = z.preprocess((v) => {
  const s = cleanText(v);
  return s === "" ? null : s;
}, z.guid().nullable());

export const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true" || v === "1", z.boolean());

export const intInRange = (min: number, max: number, fallback: number) =>
  z.preprocess((v) => {
    const n = typeof v === "number" ? v : Number.parseInt(cleanText(v), 10);
    return Number.isFinite(n) ? n : fallback;
  }, z.number().int().min(min).max(max));

/** Flattens a ZodError into { field: message }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

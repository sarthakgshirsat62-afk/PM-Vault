import { z } from "zod";

const filters = z
  .record(z.string().max(40), z.unknown())
  .refine((v) => JSON.stringify(v).length <= 2000, { message: "filters too large" });

export const trackEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("view"),
    resource_id: z.guid(),
    referrer_path: z.string().max(300).startsWith("/").optional(),
  }),
  z.object({
    type: z.literal("search"),
    query: z.string().trim().min(1).max(200),
    result_count: z.number().int().min(0).max(100000),
    filters: filters.optional(),
  }),
  z.object({
    type: z.literal("search_click"),
    search_id: z.number().int().positive(),
    resource_id: z.guid(),
  }),
]);

export type TrackEvent = z.infer<typeof trackEventSchema>;

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|httpclient|go-http-client|axios/i;

/** Heuristic: skip analytics for obvious crawlers, previewers and scripts. */
export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_PATTERN.test(userAgent);
}

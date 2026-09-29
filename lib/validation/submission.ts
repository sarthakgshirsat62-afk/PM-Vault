import { z } from "zod";
import { PRICE_TYPES } from "@/types/domain";
import { cleanText, externalUrl, optionalId, optionalText, requiredText, text } from "./fields";

export const submissionSchema = z.object({
  resource_name: requiredText(200, "Resource name"),
  resource_url: externalUrl,
  description: requiredText(2000, "Description"),
  category_id: optionalId,
  resource_type_id: optionalId,
  creator: optionalText(200),
  price_type: z.preprocess((v) => cleanText(v) || null, z.enum(PRICE_TYPES).nullable()),
  why_useful: text(2000),
  submitter_email: z.preprocess((v) => cleanText(v).toLowerCase(), z.email("Enter a valid email address").max(320)),
  consent: z.literal("on", { message: "Please confirm you agree to how we use your email." }),
  // Honeypot: real people never see or fill this field.
  website: z.preprocess((v) => cleanText(v), z.string().max(0, "Spam check failed")),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

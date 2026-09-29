import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public pages are statically cached (ISR). Any content change from the
 * admin purges every page so edits appear immediately — no deploy needed.
 */
export function revalidatePublicContent(): void {
  revalidatePath("/", "layout");
  // Metadata routes aren't under the root layout; purge the sitemap explicitly.
  revalidatePath("/sitemap.xml");
}

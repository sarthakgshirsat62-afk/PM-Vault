"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { extensionFor, validateImage } from "@/lib/files";

type Props = { name: string; label: string; defaultValue?: string | null; folder: string; hint?: string };

/**
 * Uploads straight to the Supabase "media" bucket as the signed-in user.
 * Storage RLS only allows editors; the bucket enforces type and 5 MB size.
 * The file's real type is checked from its bytes before uploading.
 */
export function ImageUploadField({ name, label, defaultValue, folder, hint }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = `f-${name}`;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus(null);
    const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    const result = validateImage(head, file.size);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${folder}/${crypto.randomUUID()}.${extensionFor(result.type)}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: result.type, upsert: false });
      if (error) {
        setStatus("Upload failed. Make sure you are signed in as an editor.");
        return;
      }
      setUrl(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      setStatus("Uploaded. Save the form to keep it.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const previewable = /^https?:\/\//i.test(url);

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
          {previewable ? (
            <Image src={url} alt="" fill sizes="160px" unoptimized className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-ink-subtle">No image</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            name={name}
            type="url"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https:// or upload a file"
            aria-describedby={`${id}-hint ${id}-status`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="btn btn-secondary btn-sm cursor-pointer">
              {busy ? "Uploading…" : "Upload image"}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="sr-only"
                disabled={busy}
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
            {url && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUrl("")}>
                Remove
              </button>
            )}
          </div>
          <p id={`${id}-hint`} className="hint">
            {hint ?? "PNG, JPEG, WebP, GIF or AVIF up to 5 MB. Only use images you have the right to display."}
          </p>
          <p id={`${id}-status`} role="status" className="text-sm text-ink-muted">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}

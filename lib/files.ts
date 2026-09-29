export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

const EXT: Record<ImageType, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif",
};

/** Detects the real image type from magic bytes (ignores the file name). */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  const b = (i: number) => bytes[i] ?? -1;
  const ascii = (start: number, len: number) =>
    String.fromCharCode(...Array.from(bytes.slice(start, start + len)));
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return "image/png";
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return "image/jpeg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4))) return "image/avif";
  return null;
}

export function extensionFor(type: ImageType): string {
  return EXT[type];
}

export type ImageCheck = { ok: true; type: ImageType } | { ok: false; error: string };

export function validateImage(bytes: Uint8Array, size: number): ImageCheck {
  if (size > IMAGE_MAX_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, error: "Upload a PNG, JPEG, WebP, GIF or AVIF image." };
  return { ok: true, type };
}

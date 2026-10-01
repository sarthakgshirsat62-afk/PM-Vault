import { describe, expect, it } from "vitest";
import { IMAGE_MAX_BYTES, sniffImageType, validateImage } from "@/lib/files";

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (s: string) => Array.from(s).map((c) => c.charCodeAt(0));

describe("sniffImageType", () => {
  it("detects real image signatures", () => {
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a))).toBe("image/png");
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffImageType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("image/webp");
    expect(sniffImageType(bytes(...ascii("GIF89a")))).toBe("image/gif");
    expect(sniffImageType(bytes(0, 0, 0, 0x1c, ...ascii("ftypavif")))).toBe("image/avif");
  });
  it("rejects SVG, HTML and executables regardless of name", () => {
    expect(sniffImageType(bytes(...ascii("<svg xmlns")))).toBeNull();
    expect(sniffImageType(bytes(...ascii("<!DOCTYPE html>")))).toBeNull();
    expect(sniffImageType(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
  });
});

describe("validateImage", () => {
  it("enforces the 5 MB limit", () => {
    const png = bytes(0x89, 0x50, 0x4e, 0x47);
    expect(validateImage(png, IMAGE_MAX_BYTES).ok).toBe(true);
    expect(validateImage(png, IMAGE_MAX_BYTES + 1).ok).toBe(false);
  });
});

import Image from "next/image";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

/** Our own storage images are optimized; other hosts are served as-is. */
function canOptimize(src: string): boolean {
  try {
    return supabaseHost !== null && new URL(src).hostname === supabaseHost;
  } catch {
    return false;
  }
}

type Props = {
  src: string | null;
  alt?: string | null;
  label: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Fixed 16:9 frame (no layout shift) with a typographic fallback. */
export function Thumbnail({ src, alt, label, sizes, priority, className = "" }: Props) {
  return (
    <div className={`relative aspect-[16/9] overflow-hidden bg-surface-muted ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!canOptimize(src)}
          className="object-cover"
        />
      ) : (
        <div aria-hidden="true" className="flex h-full items-center justify-center bg-accent-soft">
          <span className="font-display text-4xl font-semibold text-accent opacity-80">{label.slice(0, 1).toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}

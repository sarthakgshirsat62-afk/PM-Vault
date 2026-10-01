import { LABELS, type Difficulty, type PriceType } from "@/types/domain";

export function PriceBadge({ price }: { price: PriceType }) {
  const tone = price === "free" ? "bg-success-soft text-success" : price === "freemium" ? "bg-accent-soft text-accent" : "";
  return <span className={`badge ${tone}`}>{LABELS.price[price]}</span>;
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className="badge">{LABELS.difficulty[difficulty]}</span>;
}

export function EditorsPickBadge() {
  return (
    <span className="badge bg-pick-soft text-pick">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3 fill-current">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
      </svg>
      Editor&apos;s Pick
    </span>
  );
}

/** Must always render for sponsored resources (editorial policy). */
export function SponsoredBadge({ sponsor }: { sponsor?: string | null }) {
  return (
    <span className="badge bg-sponsored-soft text-sponsored" title={sponsor ? `Sponsored by ${sponsor}` : "Sponsored"}>
      Sponsored
    </span>
  );
}

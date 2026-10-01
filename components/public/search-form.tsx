type Props = {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "sm" | "lg";
  /** Visually hide the label (it is still announced to screen readers). */
  hideLabel?: boolean;
};

/** Plain GET form to /resources — works without JavaScript. */
export function SearchForm({ id, label, placeholder, defaultValue, size = "sm", hideLabel = true }: Props) {
  const large = size === "lg";
  return (
    <form action="/resources" method="get" role="search" className="w-full">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-2 block text-base font-semibold"}>
        {label}
      </label>
      <div className="relative flex">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-current text-ink-subtle ${large ? "h-5 w-5" : "h-4 w-4"}`}
        >
          <path d="M8.5 2a6.5 6.5 0 015.2 10.4l4 4-1.4 1.4-4-4A6.5 6.5 0 118.5 2zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
        </svg>
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="search"
          className={`input rounded-r-none ${large ? "min-h-14 pl-11 text-base sm:text-lg" : "pl-9 text-sm"}`}
        />
        <button type="submit" className={`btn btn-primary rounded-l-none ${large ? "min-h-14 px-6 text-base" : ""}`}>
          Search
        </button>
      </div>
    </form>
  );
}

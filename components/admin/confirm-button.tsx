"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  confirmMessage: string;
  hidden?: Record<string, string>;
  className?: string;
};

/** A one-button form that asks for confirmation before running a destructive action. */
export function ConfirmButton({ action, label, confirmMessage, hidden = {}, className = "btn btn-sm btn-ghost text-danger" }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

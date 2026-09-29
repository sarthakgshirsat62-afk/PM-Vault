type BaseProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Makes ids unique when the same field appears in several forms on one page. */
  idSuffix?: string;
};

function Hint({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="hint">
      {text}
    </p>
  ) : null;
}

export function TextField({
  name, label, hint, required, className, idSuffix, defaultValue, type = "text", maxLength, placeholder,
}: BaseProps & { defaultValue?: string | null; type?: string; maxLength?: number; placeholder?: string }) {
  const id = `f-${name}${idSuffix ? `-${idSuffix}` : ""}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="input"
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      <Hint id={`${id}-hint`} text={hint} />
    </div>
  );
}

export function TextArea({
  name, label, hint, required, className, idSuffix, defaultValue, rows = 4, maxLength,
}: BaseProps & { defaultValue?: string | null; rows?: number; maxLength?: number }) {
  const id = `f-${name}${idSuffix ? `-${idSuffix}` : ""}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        className="input"
        defaultValue={defaultValue ?? ""}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      <Hint id={`${id}-hint`} text={hint} />
    </div>
  );
}

export function SelectField({
  name, label, hint, required, className, idSuffix, defaultValue, options, emptyLabel,
}: BaseProps & { defaultValue?: string | null; options: { value: string; label: string }[]; emptyLabel?: string }) {
  const id = `f-${name}${idSuffix ? `-${idSuffix}` : ""}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        className="input"
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Hint id={`${id}-hint`} text={hint} />
    </div>
  );
}

export function CheckboxField({
  name, label, hint, idSuffix, defaultChecked, value,
}: BaseProps & { defaultChecked?: boolean; value?: string }) {
  const id = `f-${name}${value ? `-${value}` : ""}${idSuffix ? `-${idSuffix}` : ""}`;
  return (
    <div className="flex items-start gap-2">
      <input id={id} name={name} type="checkbox" value={value ?? "on"} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && <p className="hint mt-0">{hint}</p>}
      </div>
    </div>
  );
}

export function Fieldset({ legend, description, children }: { legend: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-4 p-5">
      <legend className="float-left w-full text-base font-semibold">{legend}</legend>
      <div className="clear-both">{description && <p className="text-sm text-ink-muted">{description}</p>}</div>
      {children}
    </fieldset>
  );
}

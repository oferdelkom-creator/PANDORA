'use client';

/** רכיבי טופס משותפים. גדולים, ברורים, ומתאימים לאצבע על מסך טלפון. */

export function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-lg font-semibold">{label}</label>
      {hint && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-lg focus:border-brand focus:outline-none"
    />
  );
}

export function ChoiceField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: readonly { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={selected}
            className={`block w-full rounded-lg border px-4 py-3 text-right transition-colors ${
              selected
                ? 'border-brand bg-brand-soft'
                : 'border-line bg-surface hover:border-ink-faint'
            }`}
          >
            <span className="font-medium">{o.label}</span>
            {o.hint && <span className="mt-0.5 block text-sm text-ink-soft">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-lg bg-brand px-6 py-4 text-lg font-semibold text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

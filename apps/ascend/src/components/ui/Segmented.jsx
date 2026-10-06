// Pill-style single-choice control (filters). Uses radio semantics.
export default function Segmented({ value, onChange, options, label, className = "" }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex items-center gap-1 p-1 rounded-xl border border-edge bg-abyss/70 overflow-x-auto no-scrollbar ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg font-display text-[13px] font-semibold tracking-wide transition-colors ${
              active
                ? "bg-(--accent)/15 text-(--accent) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_40%,transparent)]"
                : "text-ink-3 hover:text-ink hover:bg-white/5"
            }`}
          >
            {o.label}
            {o.count != null && (
              <span
                className={`font-mono text-[11px] tabular ${active ? "text-(--accent)/80" : "text-ink-3/80"}`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

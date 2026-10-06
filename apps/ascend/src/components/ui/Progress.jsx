// Circular progress. `value` is 0..1. Children render centered inside.
export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  color = "var(--accent)",
  track = "rgba(148, 170, 230, 0.12)",
  glow = true,
  className = "",
  children,
  label,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value || 0));
  return (
    <div
      className={`relative grid place-items-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90 absolute inset-0 overflow-visible" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{
            "--c": c,
            transition: "stroke-dashoffset 0.8s var(--ease-out-expo)",
            animation: "ring-fill 1.1s var(--ease-out-expo) backwards",
            filter: glow && v > 0 ? `drop-shadow(0 0 5px ${color})` : undefined,
            opacity: v > 0 ? 1 : 0,
          }}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

// Horizontal bar. `value` 0..1; optional `marker` (0..1) draws a tick, e.g.
// "where a steady pace would put you by now".
export function ProgressBar({
  value,
  color = "var(--accent)",
  height = 6,
  marker,
  markerLabel,
  glow = true,
  className = "",
  label,
}) {
  const v = Math.min(1, Math.max(0, value || 0));
  return (
    <div
      className={`relative w-full rounded-full bg-[rgba(148,170,230,0.1)] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full origin-left"
        style={{
          width: `${v * 100}%`,
          background: `linear-gradient(90deg, color-mix(in oklab, ${color} 55%, transparent), ${color})`,
          boxShadow: glow && v > 0 ? `0 0 12px color-mix(in oklab, ${color} 70%, transparent)` : undefined,
          transition: "width 0.7s var(--ease-out-expo)",
          animation: "bar-fill 1s var(--ease-out-expo) backwards",
        }}
      />
      {marker != null && (
        <div
          className="absolute -top-1.5 -bottom-1.5 w-0.5 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          style={{ left: `calc(${Math.min(1, Math.max(0, marker)) * 100}% - 1px)` }}
          title={markerLabel}
        />
      )}
    </div>
  );
}

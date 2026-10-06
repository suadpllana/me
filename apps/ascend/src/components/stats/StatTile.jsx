import { Minus, TrendingDown, TrendingUp } from "lucide-react";

// Tiny trend line: the de-emphasis hue for the run, the current period as an
// accent end-dot (with a surface ring so it stays legible over the line).
function Sparkline({ values, label }) {
  const w = 96;
  const h = 28;
  const pad = 5;
  const max = Math.max(1, ...values);
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="shrink-0">
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--color-ink-3)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last && <circle cx={last[0]} cy={last[1]} r="4" fill="var(--viz-series-1)" stroke="var(--color-panel)" strokeWidth="2" />}
    </svg>
  );
}

// KPI tile: label · value · optional delta (icon + text, never color alone)
// · optional sparkline.
export default function StatTile({ icon, label, value, sub, delta, spark, sparkLabel }) {
  const Icon = icon;
  return (
    <div className="sys-panel sys-panel--flat p-4 flex flex-col gap-2 min-w-0">
      <p className="flex items-center gap-2 text-[13px] text-ink-2">
        {Icon && <Icon className="w-4 h-4 text-ink-3 shrink-0" aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="font-display text-3xl font-bold text-white leading-none">{value}</p>
        {spark && <Sparkline values={spark} label={sparkLabel} />}
      </div>
      {delta ? (
        <p className="flex items-center gap-1.5 text-xs text-ink-2">
          {delta.value > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-[#0ca30c] shrink-0" aria-label="Up" />
          ) : delta.value < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-[#e66767] shrink-0" aria-label="Down" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-ink-3 shrink-0" aria-label="No change" />
          )}
          <span className="truncate">{delta.text}</span>
        </p>
      ) : (
        sub && <p className="text-xs text-ink-3 truncate">{sub}</p>
      )}
    </div>
  );
}

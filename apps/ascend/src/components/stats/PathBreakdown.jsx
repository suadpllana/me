import { Link } from "react-router-dom";
import { ChartColumn } from "lucide-react";
import Panel, { PanelTitle } from "../ui/Panel";
import PathIcon from "../ui/PathIcon";

// Where the effort went: clears per path over the last N days, as thin
// single-hue bars with the value at the tip.
export default function PathBreakdown({ paths, clears, span }) {
  const rows = paths
    .map((p) => ({ id: p.id, name: p.category.name, accent: p.accent, value: clears[p.id] ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0);

  return (
    <Panel flat className="p-4 sm:p-5" aria-labelledby="paths-breakdown-title">
      <PanelTitle
        id="paths-breakdown-title"
        icon={ChartColumn}
        right={<span className="text-xs text-ink-3">last {span} days</span>}
      >
        Clears by path
      </PanelTitle>
      <p className="mt-1 text-sm text-ink-3">
        {total > 0 ? `${total} habits and quests cleared across your paths.` : "Nothing cleared in this period yet."}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              to={`/${r.id}`}
              className="grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)] items-center gap-3 rounded-lg px-1 py-1 hover:bg-white/[0.04] transition-colors"
              aria-label={`${r.name}: ${r.value} clears`}
            >
              <span className="flex items-center gap-2 text-sm text-ink truncate">
                <PathIcon id={r.id} className="w-4 h-4 shrink-0" style={{ color: r.accent }} />
                {r.name}
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="h-3.5 rounded-r-[4px] bg-(--viz-series-1) transition-[width] duration-700"
                  style={{ width: `calc(${(r.value / max) * 100}% - 36px)`, minWidth: r.value ? 3 : 0 }}
                />
                <span className="text-xs font-semibold text-ink tabular">{r.value}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { CATEGORY_MAP } from "../../data/tasks";
import { parseDayKey } from "../../data/game";
import Panel, { PanelTitle } from "../ui/Panel";
import PathIcon from "../ui/PathIcon";

const PAGE = 12;
const monthLabel = (key) => parseDayKey(key).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const dayLabel = (key) => parseDayKey(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Every one-time quest cleared, newest first, grouped by month.
export default function Milestones({ milestones }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? milestones : milestones.slice(0, PAGE);

  const groups = [];
  for (const m of shown) {
    const label = monthLabel(m.key);
    if (groups.at(-1)?.label !== label) groups.push({ label, items: [] });
    groups.at(-1).items.push(m);
  }

  return (
    <Panel flat className="p-4 sm:p-5" aria-labelledby="milestones-title">
      <PanelTitle
        id="milestones-title"
        icon={Trophy}
        right={<span className="text-xs text-ink-3">{milestones.length} total</span>}
      >
        Milestones
      </PanelTitle>

      {milestones.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-edge px-3.5 py-3 text-sm text-ink-3">
          Clear a one-time quest and it will be recorded here forever.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <p className="sys-title text-[11px] text-ink-3 mb-1.5 px-2">{g.label}</p>
              <ul className="flex flex-col">
                {g.items.map((m) => {
                  const cat = CATEGORY_MAP[m.categoryId];
                  return (
                    <li key={`${m.key}-${m.id}`}>
                      <button
                        type="button"
                        disabled={!cat}
                        onClick={() => navigate(`/${m.categoryId}?highlight=${encodeURIComponent(m.id)}`)}
                        className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[0.04] transition-colors"
                      >
                        <span
                          className="grid place-items-center w-8 h-8 rounded-lg shrink-0 bg-white/[0.04]"
                          style={cat ? { color: cat.accent } : undefined}
                        >
                          <PathIcon id={m.categoryId} className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-ink truncate">{m.name}</span>
                          {cat && <span className="block text-xs text-ink-3">{cat.name}</span>}
                        </span>
                        <span className="shrink-0 text-xs text-ink-3 tabular">{dayLabel(m.key)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {milestones.length > PAGE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="h-10 rounded-xl border border-edge text-sm font-medium text-ink-2 hover:text-ink hover:bg-white/[0.04] transition-colors"
            >
              {showAll ? "Show fewer" : `Show all ${milestones.length}`}
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}

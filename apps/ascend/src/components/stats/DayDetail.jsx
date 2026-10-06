import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Repeat, Trophy, X } from "lucide-react";
import { CATEGORY_MAP, formatDayLabel } from "../../data/tasks";
import { shiftDay } from "../../data/game";
import Panel from "../ui/Panel";
import PathIcon from "../ui/PathIcon";

function PathTag({ categoryId }) {
  const cat = CATEGORY_MAP[categoryId];
  if (!cat) return null;
  return (
    <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[11px] text-ink-3" title={cat.name}>
      <PathIcon id={categoryId} className="w-3.5 h-3.5" style={{ color: cat.accent }} />
      <span className="hidden sm:inline">{cat.name}</span>
    </span>
  );
}

// Everything cleared on one day: each daily habit (done / missed) and the
// one-time quests. Rows jump to the quest in its path.
export default function DayDetail({ dayKey, completions, dailyTasks, today, firstKey, onSelect }) {
  const navigate = useNavigate();
  const log = completions[dayKey] ?? {};
  const open = (categoryId, id) => categoryId && navigate(`/${categoryId}?highlight=${encodeURIComponent(id)}`);

  // Daily rows: the live daily set plus any habit logged that day that has
  // since been deleted or made non-daily.
  const rows = new Map();
  for (const { task, category } of dailyTasks) {
    rows.set(task.id, { id: task.id, name: task.name, done: !!log[task.id], categoryId: category.id });
  }
  for (const [id, entry] of Object.entries(log)) {
    if (entry?.daily && !rows.has(id)) rows.set(id, { id, name: entry.name, done: true, categoryId: entry.categoryId });
  }
  const dailyRows = [...rows.values()];
  const dailyDone = dailyRows.filter((r) => r.done).length;
  const quests = Object.entries(log)
    .filter(([, e]) => !e?.daily)
    .map(([id, e]) => ({ id, name: e?.name ?? "Unknown quest", categoryId: e?.categoryId }));

  const isToday = dayKey === today;
  const navBtn =
    "grid place-items-center w-9 h-9 rounded-lg border border-edge text-ink-2 hover:text-ink hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors";

  return (
    <Panel flat className="p-4 sm:p-5" aria-labelledby="day-title">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="sys-title text-[11px] text-ink-3">{isToday ? "Today" : "Day log"}</p>
          <h2 id="day-title" className="mt-0.5 font-display text-lg sm:text-xl font-bold text-ink truncate">
            {formatDayLabel(dayKey)}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Previous day"
          className={navBtn}
          disabled={dayKey <= firstKey}
          onClick={() => onSelect(shiftDay(dayKey, -1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Next day"
          className={navBtn}
          disabled={dayKey >= today}
          onClick={() => onSelect(shiftDay(dayKey, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-sm text-ink-2">
        <span className="font-semibold text-ink">{dailyDone}</span>/{dailyRows.length} habits ·{" "}
        <span className="font-semibold text-ink">{quests.length}</span> quest{quests.length === 1 ? "" : "s"} cleared
      </p>

      {dailyRows.length > 0 && (
        <section className="mt-4" aria-label="Daily habits">
          <p className="flex items-center gap-2 sys-title text-[11px] mb-2">
            <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
            Daily habits
          </p>
          <ul className="flex flex-col gap-0.5">
            {dailyRows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => open(r.categoryId, r.id)}
                  disabled={!r.categoryId}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className={`grid place-items-center w-5 h-5 rounded-md shrink-0 ${
                      r.done ? "bg-[#3987e5] text-void" : "border border-edge-hi text-ink-3"
                    }`}
                  >
                    {r.done ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} aria-label="Done" />
                    ) : (
                      <X className="w-3 h-3" strokeWidth={2.5} aria-label="Missed" />
                    )}
                  </span>
                  <span className={`text-sm truncate ${r.done ? "text-ink" : "text-ink-3"}`}>{r.name}</span>
                  <PathTag categoryId={r.categoryId} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4" aria-label="Quests cleared">
        <p className="flex items-center gap-2 sys-title text-[11px] mb-2">
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          Quests cleared
        </p>
        {quests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-edge px-3.5 py-3 text-sm text-ink-3">
            No one-time quests cleared {isToday ? "yet today" : "this day"}.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {quests.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => open(q.categoryId, q.id)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                  <span className="text-sm text-ink truncate">{q.name}</span>
                  <PathTag categoryId={q.categoryId} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Panel>
  );
}

import { useNavigate } from "react-router-dom";
import { Flame, Repeat } from "lucide-react";
import Panel, { PanelTitle } from "../ui/Panel";
import PathIcon from "../ui/PathIcon";

// How reliably each daily habit gets done: share of the last N days it was
// cleared (one hue for every bar; the path icon beside the name is identity).
export default function HabitConsistency({ habits, span, streaks }) {
  const navigate = useNavigate();
  const sorted = [...habits].sort((a, b) => b.rate - a.rate || a.task.name.localeCompare(b.task.name));

  return (
    <Panel flat className="p-4 sm:p-5" aria-labelledby="habits-title">
      <PanelTitle
        id="habits-title"
        icon={Repeat}
        right={<span className="text-xs text-ink-3">last {span} days</span>}
      >
        Habit consistency
      </PanelTitle>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-edge px-3.5 py-3 text-sm text-ink-3">
          No daily habits yet — mark a quest as Daily to track it here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {sorted.map(({ task, category, rate, hits }) => {
            const pct = Math.round(rate * 100);
            const streak = streaks[task.id] ?? 0;
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/${category.id}?highlight=${encodeURIComponent(task.id)}`)}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-white/[0.04] transition-colors"
                  aria-label={`${task.name}: ${pct}% — cleared ${hits} of the last ${span} days${
                    streak ? `, ${streak}-day streak` : ""
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <PathIcon id={category.id} className="w-3.5 h-3.5 shrink-0" style={{ color: category.accent }} />
                    <span className="truncate text-ink">{task.name}</span>
                    {streak > 0 && (
                      <span className="ml-auto shrink-0 flex items-center gap-1 text-xs text-ink-2">
                        <Flame className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                        {streak}
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 flex items-center gap-3">
                    <span className="relative flex-1 h-2 rounded-r-[4px] bg-(--viz-track)">
                      <span
                        className="absolute inset-y-0 left-0 rounded-r-[4px] bg-(--viz-series-1) transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-[92px] shrink-0 text-right text-xs text-ink-3 tabular whitespace-nowrap">
                      <span className="font-semibold text-ink">{pct}%</span> · {hits}/{span}d
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

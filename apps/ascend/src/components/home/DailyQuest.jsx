import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ScrollText, ShieldCheck, Timer } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import { usePinned, useProgress } from "../../hooks/useLocalStorage";
import { XP_RULES } from "../../data/game";
import Panel, { PanelTitle } from "../ui/Panel";
import PathIcon from "../ui/PathIcon";
import { ProgressRing } from "../ui/Progress";
import { ResetTimer } from "../Countdown";
import TaskItem from "../tasks/TaskItem";

// Today's habits from every path in one checklist — the core daily loop,
// Solo Leveling's "Daily Quest" window.
export default function DailyQuest() {
  const { daily, habitStreaks, paths } = useGame();
  const [progress] = useProgress();
  const [pinned, togglePin] = usePinned();
  const allDone = daily.total > 0 && daily.done >= daily.total;
  const [expandDone, setExpandDone] = useState(false);
  const accent = allDone ? "#34d399" : "#4da3ff";

  const groups = paths
    .filter((p) => p.daily.total > 0)
    .map((p) => ({ path: p, rows: daily.tasks.filter((t) => t.category.id === p.id) }));

  const showList = !allDone || expandDone;

  return (
    <Panel accent={accent} brackets={allDone} className="p-4 sm:p-5" aria-labelledby="daily-quest-title">
      <PanelTitle
        id="daily-quest-title"
        icon={allDone ? ShieldCheck : ScrollText}
        right={
          daily.total > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
              <Timer className="w-3.5 h-3.5" aria-hidden="true" />
              Resets in <ResetTimer className="font-mono text-ink-2 tabular" />
            </span>
          )
        }
      >
        Daily Quest
      </PanelTitle>

      {daily.total === 0 ? (
        <p className="mt-4 text-sm text-ink-3 leading-relaxed">
          No daily habits yet. Open a path and mark a quest as <span className="text-ink-2">Daily</span> to
          train it here every day.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing value={daily.done / daily.total} size={64} stroke={6} label={`${daily.done} of ${daily.total} daily habits done`}>
              <span className="font-display text-base font-bold text-white tabular">
                {daily.done}
                <span className="text-ink-3 text-xs">/{daily.total}</span>
              </span>
            </ProgressRing>
            <div className="min-w-0">
              {allDone ? (
                <>
                  <p className="font-display text-lg font-bold text-emerald-300 leading-tight">Quest complete</p>
                  <p className="text-sm text-ink-2 mt-0.5">
                    Every habit cleared · <span className="text-ink font-semibold">+{daily.done * XP_RULES.daily} XP</span> today.
                    Penalty zone avoided.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-lg font-bold text-ink leading-tight">
                    {daily.total - daily.done} habit{daily.total - daily.done === 1 ? "" : "s"} left today
                  </p>
                  <p className="text-sm text-ink-3 mt-0.5">
                    Clear them all before midnight · <span className="text-ink-2">+{XP_RULES.daily} XP</span> each.
                  </p>
                </>
              )}
            </div>
          </div>

          {allDone && (
            <button
              type="button"
              onClick={() => setExpandDone((v) => !v)}
              aria-expanded={expandDone}
              className="mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-edge text-sm font-medium text-ink-2 hover:text-ink hover:bg-white/[0.04] transition-colors"
            >
              {expandDone ? "Hide habits" : "Show habits"}
              <ChevronDown className={`w-4 h-4 transition-transform ${expandDone ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          )}

          {showList && (
            <div className="mt-4 flex flex-col gap-4">
              {groups.map(({ path, rows }) => (
                <section key={path.id} style={{ "--accent": path.accent }} aria-label={`${path.category.name} habits`}>
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <Link
                      to={`/${path.id}`}
                      className="flex items-center gap-2 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-(--accent) hover:brightness-125"
                    >
                      <PathIcon id={path.id} className="w-3.5 h-3.5" />
                      {path.category.name}
                    </Link>
                    <span className="font-mono text-xs text-ink-3 tabular">
                      {path.daily.done}/{path.daily.total}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {rows.map(({ task }) => (
                      <li key={task.id} id={`task-${task.id}`}>
                        <TaskItem
                          task={task}
                          value={progress[task.id]}
                          accent={path.accent}
                          categoryId={path.id}
                          streak={habitStreaks[task.id] ?? 0}
                          pinned={!!pinned[task.id]}
                          onTogglePin={() => togglePin(task.id)}
                          openable
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

import { Gauge } from "lucide-react";
import { computePace, DEADLINE_DATE, START_DATE } from "../../data/tasks";
import { useGame } from "../../hooks/game-context";
import { useNowMinute } from "../../hooks/useClock";
import Panel, { PanelTitle } from "../ui/Panel";
import { ProgressBar } from "../ui/Progress";

const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Are you on track to finish every one-time quest by the deadline? Compares
// real progress with a steady, linear pace from the start date.
export default function PacePanel() {
  const { journey } = useGame();
  const now = useNowMinute();
  const p = computePace({ totalTasks: journey.total, totalDone: journey.done, now });

  const theme = p.finished
    ? { color: "#34d399", label: "Complete" }
    : p.overdue
    ? { color: "#f87171", label: "Overdue" }
    : p.status === "ahead"
    ? { color: "#34d399", label: "Ahead of pace" }
    : p.status === "behind"
    ? { color: "#f87171", label: "Behind pace" }
    : { color: "#fbbf24", label: "On track" };

  const perWeek = Math.ceil(p.perWeekNeeded);

  return (
    <Panel flat accent={theme.color} className="p-4 sm:p-5" aria-labelledby="pace-title">
      <PanelTitle
        id="pace-title"
        icon={Gauge}
        right={
          <span className="h-7 px-2.5 rounded-lg inline-flex items-center font-display text-xs font-bold uppercase tracking-wider text-(--accent) bg-(--accent)/12 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_35%,transparent)]">
            {theme.label}
          </span>
        }
      >
        Pace
      </PanelTitle>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <span className="font-display text-3xl font-bold text-white leading-none">{journey.pct}%</span>
          <span className="ml-2 text-sm text-ink-3">done</span>
        </div>
        {!p.finished && (
          <span className="text-xs text-ink-3 text-right">
            target <span className="font-mono text-ink-2 tabular">~{p.expectedPct}%</span> by now
          </span>
        )}
      </div>

      <ProgressBar
        value={journey.pct / 100}
        marker={p.finished ? undefined : p.expectedPct / 100}
        markerLabel={`Expected ~${p.expectedPct}% by now`}
        height={8}
        className="mt-3"
        label="Journey progress"
      />
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-3">
        <span>{shortDate(START_DATE)}</span>
        <span>{shortDate(DEADLINE_DATE)}</span>
      </div>

      <p className="mt-4 text-sm text-ink-2 leading-relaxed">
        {p.finished ? (
          <>Every quest is complete. Legendary.</>
        ) : p.overdue ? (
          <>
            The deadline has passed with <span className="font-semibold text-ink">{p.remainingTasks}</span> steps left.
          </>
        ) : (
          <>
            You&apos;re{" "}
            <span className="font-semibold text-(--accent)">
              {p.deltaPct >= 0 ? `${p.deltaPct}% ahead of` : `${Math.abs(p.deltaPct)}% behind`}
            </span>{" "}
            a steady pace. Clear about <span className="font-semibold text-ink">{perWeek}</span> step
            {perWeek === 1 ? "" : "s"} a week to finish the remaining{" "}
            <span className="font-semibold text-ink">{p.remainingTasks}</span> in{" "}
            <span className="font-semibold text-ink">{p.daysLeft}</span> days.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-ink-3">Steps = one-time quests plus each checklist item. Daily habits don&apos;t count here.</p>
    </Panel>
  );
}

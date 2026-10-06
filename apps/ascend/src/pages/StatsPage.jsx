import { useMemo, useState } from "react";
import { CalendarCheck, Flame, Repeat, Trophy } from "lucide-react";
import { START_DATE, dayKey } from "../data/tasks";
import { buildHistory } from "../data/game";
import { useGame } from "../hooks/game-context";
import { useCompletions } from "../hooks/useLocalStorage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatTile from "../components/stats/StatTile";
import ActivityHeatmap from "../components/stats/ActivityHeatmap";
import DayDetail from "../components/stats/DayDetail";
import HabitConsistency from "../components/stats/HabitConsistency";
import PathBreakdown from "../components/stats/PathBreakdown";
import Milestones from "../components/stats/Milestones";

const START_KEY = dayKey(new Date(START_DATE));
const fmt = new Intl.NumberFormat("en-US");

export default function StatsPage() {
  const game = useGame();
  const completions = useCompletions();
  const { today, streak, clears } = game;
  const dailyTasks = game.daily.tasks;
  const history = useMemo(
    () => buildHistory(completions, dailyTasks, today, START_KEY),
    [completions, dailyTasks, today]
  );
  const [selected, setSelected] = useState(today);
  useDocumentTitle("Stats");

  const rate = history.rate7;
  const deltaPts = rate != null && history.ratePrev7 != null ? Math.round((rate - history.ratePrev7) * 100) : null;

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <header className="animate-rise">
        <p className="sys-title text-[11px] text-ink-3">Records</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">The record of your ascent</h1>
        <p className="mt-1.5 text-sm text-ink-2">Every habit and quest you clear is logged here, day by day.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-rise [animation-delay:60ms]">
        <StatTile
          icon={Flame}
          label="Day streak"
          value={streak.current}
          sub={
            streak.current === 0
              ? streak.best > 0
                ? `Best ${streak.best} days · start a new one`
                : "Clear a quest to start one"
              : streak.doneToday
              ? `Best ${streak.best} days`
              : "Clear a quest today to keep it"
          }
        />
        <StatTile
          icon={Repeat}
          label="Habit rate · 7 days"
          value={rate == null ? "—" : `${Math.round(rate * 100)}%`}
          delta={
            deltaPts == null
              ? null
              : {
                  value: deltaPts,
                  text:
                    deltaPts === 0
                      ? "Same as prior week"
                      : `${deltaPts > 0 ? "+" : "−"}${Math.abs(deltaPts)} pts vs prior week`,
                }
          }
          sub="Share of daily habits done"
        />
        <StatTile
          icon={Trophy}
          label="Total clears"
          value={fmt.format(clears.total)}
          spark={history.spark}
          sparkLabel={`Clears per day over the last 14 days: ${history.spark.join(", ")}`}
          sub={`${fmt.format(clears.daily)} habits · ${fmt.format(clears.oneTime)} quests`}
        />
        <StatTile
          icon={CalendarCheck}
          label="Active days"
          value={history.activeDays}
          sub={`of ${history.days.length} since the start`}
        />
      </div>

      <div className="animate-rise [animation-delay:120ms]">
        <ActivityHeatmap days={history.days} selected={selected} onSelect={setSelected} today={today} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 items-start animate-rise [animation-delay:180ms]">
        <DayDetail
          dayKey={selected}
          completions={completions}
          dailyTasks={dailyTasks}
          today={today}
          firstKey={history.firstKey}
          onSelect={setSelected}
        />
        <HabitConsistency habits={history.habits} span={history.span} streaks={game.habitStreaks} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 items-start">
        <PathBreakdown paths={game.paths} clears={history.pathClears} span={history.span} />
        <Milestones milestones={history.milestones} />
      </div>
    </div>
  );
}

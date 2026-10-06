import { Compass } from "lucide-react";
import { useGame } from "../hooks/game-context";
import { useNowMinute } from "../hooks/useClock";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatusWindow from "../components/home/StatusWindow";
import DailyQuest from "../components/home/DailyQuest";
import FocusList from "../components/home/FocusList";
import PacePanel from "../components/home/PacePanel";
import PathCard from "../components/home/PathCard";
import { PanelTitle } from "../components/ui/Panel";

function greeting(hour) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// One line from "the System" telling you what matters right now.
function systemLine({ daily, streak, journey }) {
  const left = daily.total - daily.done;
  if (daily.total > 0 && left > 0) {
    if (!streak.doneToday && streak.current > 0) {
      return `Your ${streak.current}-day streak is at risk — clear a habit to keep it alive.`;
    }
    return `${left} habit${left === 1 ? "" : "s"} remain in today's Daily Quest.`;
  }
  if (daily.total > 0) return "Daily Quest complete. Push a one-time quest forward.";
  if (journey.pct >= 100) return "Every quest is cleared. You have reached the summit.";
  return "Choose a path and clear your next quest.";
}

export default function HomePage() {
  const game = useGame();
  const now = useNowMinute();
  useDocumentTitle(null);
  const date = new Date(now);
  const dateLabel = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <header className="animate-rise">
        <p className="sys-title text-[11px] text-ink-3">{dateLabel}</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">{greeting(date.getHours())}, Hunter.</h1>
        <p className="mt-1.5 text-sm sm:text-[15px] text-ink-2">
          <span className="font-display font-semibold text-system">[System]</span> {systemLine(game)}
        </p>
      </header>

      <div className="animate-rise [animation-delay:60ms]">
        <StatusWindow />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start animate-rise [animation-delay:120ms]">
        <DailyQuest />
        <div className="flex flex-col gap-5 lg:gap-6 xl:sticky xl:top-8">
          <FocusList />
          <PacePanel />
        </div>
      </div>

      <section aria-labelledby="paths-title" className="animate-rise [animation-delay:180ms]">
        <PanelTitle id="paths-title" icon={Compass} className="mb-3 px-1">
          Paths
        </PanelTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {game.paths.map((p) => (
            <PathCard key={p.id} path={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

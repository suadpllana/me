import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import RankEmblem from "../ui/RankEmblem";
import { ProgressBar } from "../ui/Progress";

// Compact player card: rank crest, level, XP to next level, streak + today.
export default function HunterCard() {
  const { rank, xp, streak, daily } = useGame();
  return (
    <Link
      to="/"
      className="block rounded-2xl border border-edge bg-abyss/60 p-3.5 hover:border-edge-hi transition-colors"
      style={{ "--accent": rank.color }}
      aria-label={`Level ${xp.level}, ${rank.id}-Rank ${rank.title}`}
    >
      <div className="flex items-center gap-3">
        <RankEmblem rank={rank} size={46} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">Lv</span>
            <span className="font-display text-2xl font-bold text-white tabular leading-none">{xp.level}</span>
          </div>
          <p className="text-[13px] font-medium text-(--accent) truncate mt-0.5">{rank.title}</p>
        </div>
      </div>
      <ProgressBar value={xp.pct} height={5} className="mt-3" label="XP to next level" />
      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-ink-3 tabular">
        <span>
          {xp.into}/{xp.need} XP
        </span>
        <span className="flex items-center gap-2.5">
          <span className="flex items-center gap-1" title="Day streak">
            <Flame
              className={`w-3.5 h-3.5 ${streak.current > 0 ? "text-orange-400" : "text-ink-3"}`}
              aria-hidden="true"
            />
            {streak.current}
          </span>
          {daily.total > 0 && (
            <span title="Daily habits cleared today">
              {daily.done}/{daily.total}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}

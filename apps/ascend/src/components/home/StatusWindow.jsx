import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Info, Trophy } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import { XP_RULES } from "../../data/game";
import Panel from "../ui/Panel";
import RankEmblem from "../ui/RankEmblem";
import PathIcon from "../ui/PathIcon";
import Modal from "../ui/Modal";
import Glow from "../ui/Glow";
import { ProgressBar, ProgressRing } from "../ui/Progress";
import { DeadlineCountdown } from "../Countdown";

const fmt = new Intl.NumberFormat("en-US");

function HowXpWorks({ onClose }) {
  const { nextRank } = useGame();
  return (
    <Modal open onClose={onClose} icon={Info} title="How leveling works" accent="#4da3ff">
      <ul className="flex flex-col gap-2.5 text-sm">
        {[
          ["Daily habit cleared", XP_RULES.daily, "each day"],
          ["Checklist item ticked", XP_RULES.item, "one-time lists"],
          ["Quest fully cleared", XP_RULES.quest, "bonus"],
        ].map(([label, xp, note]) => (
          <li key={label} className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-abyss/50 px-3.5 py-2.5">
            <span className="text-ink">
              {label} <span className="text-ink-3">· {note}</span>
            </span>
            <span className="font-display font-bold text-(--accent) tabular">+{xp} XP</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-2 leading-relaxed">
        Each path trains an attribute (Faith, Wealth, Intellect, Strength, Luck) that grows with the XP
        you earn there. Hunter rank rises with your level — E, D, C, B, A, then S.
        {nextRank && (
          <>
            {" "}
            Next: <span className="text-ink font-semibold">{nextRank.id}-Rank at Lv {nextRank.minLevel}</span>.
          </>
        )}
      </p>
      <p className="mt-3 text-xs text-ink-3 leading-relaxed">
        Everything is calculated from your progress and history, so it stays identical on every synced device.
      </p>
    </Modal>
  );
}

// The home hero, styled after the Solo Leveling status window: rank crest,
// level + XP, journey completion, attributes per path, streak and deadline.
export default function StatusWindow() {
  const { rank, xp, journey, paths, streak, clears } = useGame();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Panel accent="#4da3ff" brackets className="p-5 sm:p-6" aria-labelledby="status-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <Glow color={rank.color} opacity={0.14} className="-top-28 -left-20 w-80 h-80" />
        <Glow color="#4da3ff" opacity={0.12} className="-bottom-32 right-10 w-96 h-72" />
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <h1 id="status-title" className="sys-title flex items-center gap-2">
          <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-(--accent) shadow-[0_0_8px_var(--accent)]" />
          Status
        </h1>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 h-8 px-2.5 -mr-1.5 rounded-lg text-xs font-medium text-ink-3 hover:text-ink hover:bg-white/[0.05] transition-colors"
        >
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          How XP works
        </button>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        {/* Level block */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <RankEmblem rank={rank} size={88} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-ink-3">Level</span>
              <span className="font-display text-5xl sm:text-6xl font-bold text-white tabular leading-none text-glow">
                {xp.level}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink-2">
              <span className="font-semibold" style={{ color: rank.color }}>
                {rank.id}-Rank
              </span>{" "}
              · {rank.title}
            </p>
            <ProgressBar value={xp.pct} height={7} className="mt-3 max-w-md" label="XP to next level" />
            <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-xs text-ink-3 tabular">
              <span>
                <span className="text-ink-2">{fmt.format(xp.into)}</span> / {fmt.format(xp.need)} XP
              </span>
              <span>{fmt.format(xp.total)} total</span>
            </p>
          </div>
        </div>

        {/* Journey ring + countdown */}
        <div className="flex items-center gap-5 md:pl-6 md:border-l md:border-edge/80">
          <ProgressRing value={journey.pct / 100} size={104} stroke={8} color="#4da3ff" label={`Journey ${journey.pct}% complete`}>
            <div className="text-center leading-none">
              <div className="font-display text-2xl font-bold text-white tabular">{journey.pct}%</div>
              <div className="mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                Journey
              </div>
            </div>
          </ProgressRing>
          <DeadlineCountdown />
        </div>
      </div>

      {/* Attributes */}
      <ul className="relative mt-6 grid grid-cols-5 gap-2" aria-label="Attributes">
        {paths.map((p) => (
          <li key={p.id} style={{ "--accent": p.accent }}>
            <Link
              to={`/${p.id}`}
              title={`${p.attribute.name} — earned from ${p.category.name} quests`}
              className="flex flex-col items-center gap-1 rounded-xl border border-edge/80 bg-abyss/50 px-1 py-2.5 hover:border-(--accent)/50 hover:bg-(--accent)/[0.06] transition-colors"
            >
              <PathIcon id={p.id} className="w-4 h-4 text-(--accent)" />
              <span className="font-display text-lg sm:text-xl font-bold text-white tabular leading-none">{p.stat}</span>
              <span className="font-display text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] text-ink-3">
                {p.attribute.short}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer stats */}
      <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2">
        <span className="flex items-center gap-2">
          <Flame
            className={`w-4 h-4 ${streak.current > 0 ? "text-orange-400" : "text-ink-3"} ${
              streak.doneToday && streak.current >= 3 ? "animate-flame" : ""
            }`}
            aria-hidden="true"
          />
          {streak.current > 0 ? (
            <span>
              <span className="font-semibold text-ink tabular">{streak.current}</span>-day streak
              {!streak.doneToday && <span className="text-orange-300/90"> · clear a quest today to keep it</span>}
            </span>
          ) : (
            <span>No streak yet · clear a quest to start one</span>
          )}
        </span>
        {streak.best > 0 && (
          <span className="text-ink-3">
            Best <span className="text-ink-2 tabular">{streak.best}</span>
          </span>
        )}
        <span className="flex items-center gap-2 text-ink-3">
          <Trophy className="w-4 h-4" aria-hidden="true" />
          <span className="text-ink-2 tabular">{fmt.format(clears.total)}</span> clears logged
        </span>
      </div>

      {showHelp && <HowXpWorks onClose={() => setShowHelp(false)} />}
    </Panel>
  );
}

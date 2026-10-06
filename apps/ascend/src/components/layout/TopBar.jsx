import { Link } from "react-router-dom";
import { useGame } from "../../hooks/game-context";
import Brand from "./Brand";
import SyncButton from "./SyncButton";

// Phone / tablet header: brand, level chip, sync. Fits a 320px screen.
export default function TopBar() {
  const { rank, xp } = useGame();
  return (
    <header className="lg:hidden sticky top-0 z-40 border-b border-edge/70 bg-void/75 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto max-w-3xl h-14 px-4 flex items-center justify-between gap-3">
        <Brand />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 h-10 pl-1.5 pr-3 rounded-xl border border-edge bg-abyss/60"
            style={{ "--accent": rank.color }}
            aria-label={`Level ${xp.level}, ${rank.id}-Rank ${rank.title}`}
          >
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-(--accent)/15 font-brand font-black italic text-sm text-(--accent)">
              {rank.id}
            </span>
            <span className="flex flex-col justify-center gap-1">
              <span className="font-display text-xs font-bold text-ink leading-none tabular">Lv {xp.level}</span>
              <span className="block w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-(--accent) transition-[width] duration-700"
                  style={{ width: `${Math.round(xp.pct * 100)}%` }}
                />
              </span>
            </span>
          </Link>
          <SyncButton />
        </div>
      </div>
    </header>
  );
}

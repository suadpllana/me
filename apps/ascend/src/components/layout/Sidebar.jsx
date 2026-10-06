import { NavLink } from "react-router-dom";
import { ArrowUpRight, ChartColumn, Clapperboard, House, Hourglass } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import PathIcon from "../ui/PathIcon";
import Brand from "./Brand";
import HunterCard from "./HunterCard";
import SyncButton from "./SyncButton";
import { DaysLeft } from "../Countdown";
import { MEDIA_URL } from "./nav";

function MainLink({ to, end, icon, children }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-colors ${
          isActive ? "bg-system/12 text-system-hi" : "text-ink-2 hover:text-ink hover:bg-white/[0.05]"
        }`
      }
    >
      <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
      {children}
    </NavLink>
  );
}

// Desktop navigation rail (lg and up).
export default function Sidebar() {
  const { paths } = useGame();
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[272px] flex-col border-r border-edge/80 bg-void/70 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
      <div className="px-5 pt-5 pb-4">
        <Brand />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-6">
        <HunterCard />

        <nav aria-label="Main" className="flex flex-col gap-1">
          <MainLink to="/" end icon={House}>
            Home
          </MainLink>
          <MainLink to="/stats" icon={ChartColumn}>
            Stats
          </MainLink>
        </nav>

        <nav aria-label="Paths" className="flex flex-col gap-1">
          <p className="sys-title text-[11px] text-ink-3 px-3 mb-1">Paths</p>
          {paths.map((p) => (
            <NavLink
              key={p.id}
              to={`/${p.id}`}
              title={`${p.journey.done}/${p.journey.total} steps · ${p.cleared}/${p.quests} quests`}
              style={{ "--accent": p.accent }}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  isActive ? "bg-(--accent)/10" : "hover:bg-white/[0.05]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-(--accent)/12 text-(--accent) shrink-0">
                    <PathIcon id={p.id} className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium truncate ${isActive ? "text-(--accent)" : "text-ink"}`}
                      >
                        {p.category.name}
                      </span>
                      <span className="font-mono text-[11px] text-ink-3 tabular">{p.journey.pct}%</span>
                    </span>
                    <span className="mt-1.5 block h-1 rounded-full bg-white/[0.07] overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-(--accent) transition-[width] duration-700"
                        style={{ width: `${p.journey.pct}%` }}
                      />
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <a
          href={MEDIA_URL}
          target="_top"
          className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-ink-2 hover:text-ink hover:bg-white/[0.05] transition-colors"
        >
          <Clapperboard className="w-[18px] h-[18px]" aria-hidden="true" />
          <span className="flex-1">Media tracker</span>
          <ArrowUpRight className="w-4 h-4 text-ink-3" aria-hidden="true" />
        </a>
      </div>

      <div className="border-t border-edge/80 px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-3 h-10 px-3 text-sm text-ink-2">
          <Hourglass className="w-[18px] h-[18px] text-system" aria-hidden="true" />
          <DaysLeft />
        </div>
        <SyncButton variant="row" />
      </div>
    </aside>
  );
}

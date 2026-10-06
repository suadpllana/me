import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChartColumn, Compass, House } from "lucide-react";
import { CATEGORY_MAP } from "../../data/tasks";
import PathsSheet from "./PathsSheet";

const itemClass = (active) =>
  `relative flex-1 flex flex-col items-center justify-center gap-1 h-full font-display text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
    active ? "text-system-hi" : "text-ink-3 hover:text-ink-2"
  }`;

function ActiveGlow() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full bg-system shadow-[0_0_14px_2px_rgba(77,163,255,0.55)]"
    />
  );
}

// Phone / tablet tab bar: Home · Paths (sheet) · Stats. Thumb-reachable and
// safe-area aware for iPhones.
export default function BottomNav() {
  const { pathname } = useLocation();
  const [pathsOpen, setPathsOpen] = useState(false);
  const onPath = !!CATEGORY_MAP[pathname.slice(1)];

  return (
    <>
      <nav
        aria-label="Primary"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-edge/70 bg-void/85 backdrop-blur-xl pb-[var(--safe-bottom)]"
      >
        <div className="mx-auto max-w-md h-[var(--nav-h)] flex items-stretch">
          <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <ActiveGlow />}
                <House className="w-[22px] h-[22px]" aria-hidden="true" />
                Home
              </>
            )}
          </NavLink>
          <button
            type="button"
            onClick={() => setPathsOpen(true)}
            className={itemClass(onPath)}
            aria-haspopup="dialog"
          >
            {onPath && <ActiveGlow />}
            <Compass className="w-[22px] h-[22px]" aria-hidden="true" />
            Paths
          </button>
          <NavLink to="/stats" className={({ isActive }) => itemClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <ActiveGlow />}
                <ChartColumn className="w-[22px] h-[22px]" aria-hidden="true" />
                Stats
              </>
            )}
          </NavLink>
        </div>
      </nav>
      <PathsSheet open={pathsOpen} onClose={() => setPathsOpen(false)} />
    </>
  );
}

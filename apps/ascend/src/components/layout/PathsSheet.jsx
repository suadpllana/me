import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Clapperboard, Compass } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import Modal from "../ui/Modal";
import PathIcon from "../ui/PathIcon";
import { MEDIA_URL } from "./nav";

// Bottom sheet listing every path with its progress (phone navigation).
export default function PathsSheet({ open, onClose }) {
  const { paths } = useGame();
  return (
    <Modal open={open} onClose={onClose} icon={Compass} title="Paths" description="Choose where to train next.">
      <ul className="flex flex-col gap-2">
        {paths.map((p) => (
          <li key={p.id} style={{ "--accent": p.accent }}>
            <Link
              to={`/${p.id}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl border border-edge bg-abyss/50 p-3 hover:border-(--accent)/50 transition-colors"
            >
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-(--accent)/12 text-(--accent) shrink-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_30%,transparent)]">
                <PathIcon id={p.id} className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-[15px] font-bold text-ink">{p.category.name}</span>
                  <span className="font-mono text-xs text-(--accent) tabular">{p.journey.pct}%</span>
                </span>
                <span className="mt-1.5 block h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                  <span className="block h-full rounded-full bg-(--accent)" style={{ width: `${p.journey.pct}%` }} />
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-3">
                  <span>
                    {p.journey.done}/{p.journey.total} steps
                  </span>
                  <span>
                    {p.cleared}/{p.quests} quests
                  </span>
                  {p.daily.total > 0 && (
                    <span>
                      {p.daily.done}/{p.daily.total} daily today
                    </span>
                  )}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-ink-3 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <a
        href={MEDIA_URL}
        target="_top"
        onClick={onClose}
        className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-edge p-3 text-sm text-ink-2 hover:text-ink hover:border-edge-hi transition-colors"
      >
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-pink-400/10 text-pink-300 shrink-0">
          <Clapperboard className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="flex-1">Media tracker</span>
        <ArrowUpRight className="w-4 h-4 text-ink-3" aria-hidden="true" />
      </a>
    </Modal>
  );
}

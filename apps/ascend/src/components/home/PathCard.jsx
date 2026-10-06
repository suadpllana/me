import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PathIcon from "../ui/PathIcon";
import { ProgressBar } from "../ui/Progress";

// Overview card for one path on the home grid.
export default function PathCard({ path }) {
  const { category, journey, daily, cleared, quests, nextUp, attribute, stat } = path;
  return (
    <Link
      to={`/${path.id}`}
      style={{ "--accent": path.accent }}
      className="sys-panel sys-panel--flat group flex flex-col p-4 hover:-translate-y-0.5 hover:border-(--accent)/45 hover:shadow-[0_18px_40px_-24px_var(--accent)] transition-[transform,border-color,box-shadow] duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-(--accent)/12 text-(--accent) shrink-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_30%,transparent),0_0_20px_-6px_var(--accent)]">
          <PathIcon id={path.id} className="w-5 h-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold text-ink leading-tight truncate">{category.name}</span>
          <span className="block text-xs text-ink-3 mt-0.5 truncate">{category.tagline}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-lg font-bold text-(--accent) tabular leading-tight">{journey.pct}%</span>
          <span
            className="block mt-0.5 font-display text-[11px] font-semibold tracking-[0.12em] text-ink-3"
            title={`${attribute.name} ${stat}`}
          >
            {attribute.short} <span className="text-ink-2 tabular">{stat}</span>
          </span>
        </span>
      </div>

      <ProgressBar value={journey.pct / 100} height={5} className="mt-4" label={`${category.name} progress`} />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
        <span>
          <span className="text-ink-2 tabular">{cleared}</span>/{quests} quests
        </span>
        <span>
          <span className="text-ink-2 tabular">{journey.done}</span>/{journey.total} steps
        </span>
        {daily.total > 0 && (
          <span>
            <span className="text-ink-2 tabular">{daily.done}</span>/{daily.total} today
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-edge/70 flex items-center gap-2 text-sm min-w-0">
        {nextUp ? (
          <>
            <span className="sys-title text-[10px] text-ink-3 shrink-0">Next</span>
            <span className="truncate text-ink-2 group-hover:text-ink transition-colors">{nextUp.name}</span>
          </>
        ) : (
          <span className="text-ink-3">{quests ? "All quests cleared" : "No quests yet"}</span>
        )}
        <ArrowRight
          className="ml-auto w-4 h-4 shrink-0 text-ink-3 group-hover:text-(--accent) group-hover:translate-x-0.5 transition"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

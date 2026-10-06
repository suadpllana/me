import { useEffect, useRef, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Crosshair, Info, Plus, Repeat, ScrollText, Search, Trophy, X } from "lucide-react";
import { CATEGORY_MAP, isTaskComplete } from "../data/tasks";
import { useGame } from "../hooks/game-context";
import { useCustomTasks, usePinned, useProgress } from "../hooks/useLocalStorage";
import { useToast } from "../components/feedback/toast-context";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import Panel, { PanelTitle } from "../components/ui/Panel";
import PathIcon from "../components/ui/PathIcon";
import Glow from "../components/ui/Glow";
import Segmented from "../components/ui/Segmented";
import { ProgressRing } from "../components/ui/Progress";
import TaskItem from "../components/tasks/TaskItem";
import TaskFormModal from "../components/tasks/TaskFormModal";
import FocusList from "../components/home/FocusList";
import { collectFocus, doneKeys } from "../components/home/focus";

// Re-mount per path so search / filter state starts fresh on each one.
export default function CategoryRoute() {
  const { id } = useParams();
  if (!CATEGORY_MAP[id]) return <Navigate to="/" replace />;
  return <CategoryPage key={id} id={id} />;
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-edge/80 bg-abyss/50 px-3 py-2.5 min-w-0">
      <p className="sys-title text-[10px] text-ink-3 truncate">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-ink tabular leading-none truncate">
        {value}
        {sub != null && <span className="text-ink-3 text-sm font-semibold">/{sub}</span>}
      </p>
    </div>
  );
}

function Section({ icon, title, right, children, id }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <PanelTitle id={id} icon={icon} right={right} className="px-1">
        {title}
      </PanelTitle>
      {children}
    </section>
  );
}

function EmptyNote({ children }) {
  return (
    <p className="rounded-2xl border border-dashed border-edge bg-panel/30 px-4 py-5 text-sm text-ink-3 text-center">
      {children}
    </p>
  );
}

function CategoryPage({ id }) {
  const game = useGame();
  const path = game.paths.find((p) => p.id === id);
  const { category, accent } = path;
  const [progress] = useProgress();
  const [pinned, togglePin] = usePinned();
  const { customTasks, addCustomTask, deleteTask, editTask } = useCustomTasks();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const searchRef = useRef(null);
  useDocumentTitle(category.name);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [clearedOnArrival] = useState(
    () => new Set(category.tasks.filter((t) => !t.daily && isTaskComplete(t, progress[t.id])).map((t) => t.id))
  );
  const [focusFinished] = useState(() => doneKeys(pinned, progress, [path]));

  // Deep link (?highlight=<taskId>): scroll the row into view, pulse it, then
  // drop the param so a refresh doesn't replay it.
  useEffect(() => {
    if (!highlightId) return;
    let cleared = false;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`task-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.setProperty("--hl", accent);
        el.classList.add("task-highlight");
        setTimeout(() => el.classList.remove("task-highlight"), 2600);
      }
      cleared = true;
      setSearchParams({}, { replace: true });
    });
    return () => {
      if (!cleared) cancelAnimationFrame(raf);
    };
  }, [highlightId, accent, setSearchParams]);

  // Keyboard: "/" focuses search, "n" opens New quest.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      if (document.querySelector('[role="dialog"], [role="menu"]')) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "n") {
        e.preventDefault();
        setAdding(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const customIds = new Set((customTasks[id] ?? []).map((t) => t.id));
  const tasks = category.tasks;
  // Sections are sorted by what was cleared when you arrived: a quest you
  // clear (or reopen) now stays where it is — showing its new state, one tap
  // from undo — and moves to its new section on your next visit.
  const wasCleared = (t) => clearedOnArrival.has(t.id);
  const inFocus = (t) => pinned[t.id] && !focusFinished.has(t.id);

  const focusCount = collectFocus([path], pinned, progress, focusFinished).count;
  const dailyTasks = tasks.filter((t) => t.daily && !inFocus(t));
  const activeQuests = tasks
    .filter((t) => !t.daily && !wasCleared(t) && !pinned[t.id])
    .sort((a, b) => (a.type === "check" ? 0 : 1) - (b.type === "check" ? 0 : 1));
  const clearedQuests = tasks
    .filter((t) => !t.daily && wasCleared(t))
    .sort((a, b) => (progress[a.id] === "no-profit" ? 1 : 0) - (progress[b.id] === "no-profit" ? 1 : 0));

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const itemMatches = (t) =>
    t.type === "checklist" &&
    ((progress[t.id]?.items ?? []).some((it) => it.name.toLowerCase().includes(q)) ||
      (t.defaultItems ?? []).some((name) => name.toLowerCase().includes(q)));
  const results = searching ? tasks.filter((t) => t.name.toLowerCase().includes(q) || itemMatches(t)) : [];

  const renderTask = (task, extra = {}) => (
    <li key={task.id} id={`task-${task.id}`}>
      <TaskItem
        task={task}
        value={progress[task.id]}
        accent={accent}
        categoryId={id}
        pinned={!!pinned[task.id]}
        streak={game.habitStreaks[task.id] ?? 0}
        onTogglePin={() => togglePin(task.id)}
        onDelete={() => {
          deleteTask(id, task.id, customIds.has(task.id));
          toast({ message: `Deleted “${task.name}”`, accent: "#94a3b8" });
        }}
        onEdit={(changes) => {
          editTask(id, task.id, customIds.has(task.id), changes, changes.type !== task.type);
          toast("Quest updated");
        }}
        {...extra}
      />
    </li>
  );

  const addQuest = ({ name, type, daily }) => {
    const newId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const base =
      type === "checklist"
        ? { id: newId, type: "checklist", name, target: 1 }
        : { id: newId, type: "check", name };
    addCustomTask(id, daily ? { ...base, daily: true } : base);
    setAdding(false);
    setQuery("");
    setFilter("all");
    toast({ title: "New quest", message: name, accent });
    setSearchParams({ highlight: newId }, { replace: true });
  };

  const show = (section) => filter === "all" || filter === section;
  const filterOptions = [
    { value: "all", label: "All", count: tasks.length },
    ...(tasks.some((t) => t.daily) ? [{ value: "daily", label: "Daily", count: tasks.filter((t) => t.daily).length }] : []),
    { value: "active", label: "Active", count: focusCount + activeQuests.length },
    { value: "cleared", label: "Cleared", count: clearedQuests.length },
  ];

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-5" style={{ "--accent": accent }}>
      {/* Hero */}
      <Panel accent={accent} brackets className="p-5 sm:p-6 animate-rise">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <Glow color={accent} opacity={0.18} className="-top-24 -right-12 w-72 h-72" />
        </div>
        <div className="relative flex items-center gap-4">
          <span className="grid place-items-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-(--accent)/12 text-(--accent) shrink-0 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_40%,transparent),0_0_32px_-8px_var(--accent)]">
            <PathIcon id={id} className="w-7 h-7 sm:w-8 sm:h-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="sys-title text-[11px] text-ink-3 truncate">
              <span className="hidden sm:inline">Trains {path.attribute.name} · </span>
              {path.attribute.short} {path.stat}
            </p>
            <h1 className="mt-0.5 font-display text-3xl sm:text-4xl font-bold text-(--accent) text-glow leading-none">
              {category.name}
            </h1>
            <p className="mt-1.5 text-sm text-ink-2 truncate">{category.tagline}</p>
          </div>
          <ProgressRing value={path.journey.pct / 100} size={76} stroke={7} label={`${category.name} ${path.journey.pct}% complete`}>
            <span className="font-display text-lg font-bold text-white tabular">{path.journey.pct}%</span>
          </ProgressRing>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <Stat label="Quests" value={path.cleared} sub={path.quests} />
          <Stat label="Steps" value={path.journey.done} sub={path.journey.total} />
          {path.daily.total > 0 ? (
            <Stat label="Today" value={path.daily.done} sub={path.daily.total} />
          ) : (
            <Stat label="XP earned" value={path.xp.toLocaleString("en-US")} />
          )}
        </div>
      </Panel>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 animate-rise [animation-delay:60ms]">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Search quests & items…"
              aria-label={`Search ${category.name} quests`}
              className="w-full h-11 rounded-xl border border-edge bg-panel/60 pl-10 pr-10 text-sm text-ink placeholder:text-ink-3/80 focus:outline-none focus:border-(--accent)/60 transition-colors [&::-webkit-search-cancel-button]:hidden"
            />
            {searching && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-lg text-ink-3 hover:text-ink hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-xl font-display text-sm font-bold tracking-wide bg-(--accent) text-void shadow-[0_0_22px_-4px_var(--accent)] hover:brightness-110 transition"
            title="New quest (N)"
          >
            <Plus className="w-4 h-4" strokeWidth={2.75} aria-hidden="true" />
            <span className="hidden sm:inline">New quest</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
        {!searching && (
          <Segmented value={filter} onChange={setFilter} options={filterOptions} label="Filter quests" className="self-start max-w-full" />
        )}
        {id === "money" && !searching && (
          <p className="flex items-start gap-2 px-1 text-xs text-ink-3 leading-relaxed">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Tap a cleared money quest again to mark it <span className="text-ink-2">No profit</span> (tap once
              more to reopen).
            </span>
          </p>
        )}
      </div>

      {/* Content */}
      {searching ? (
        <Section id="results-title" icon={Search} title="Results" right={<span className="font-mono text-xs text-ink-3">{results.length}</span>}>
          {results.length === 0 ? (
            <EmptyNote>No quests or items match “{query}”.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((t) =>
                renderTask(t, { showDaily: true, forceOpen: !t.name.toLowerCase().includes(q) && itemMatches(t) })
              )}
            </ul>
          )}
        </Section>
      ) : tasks.length === 0 ? (
        <EmptyNote>No quests on this path yet. Add your first one with “New quest”.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-7 animate-rise [animation-delay:120ms]">
          {show("active") && focusCount > 0 && (
            <Section id="focus-title" icon={Crosshair} title="Focus" right={<span className="font-mono text-xs text-ink-3">{focusCount}</span>}>
              <FocusList pathIds={[id]} variant="list" manage finished={focusFinished} />
            </Section>
          )}

          {show("daily") && dailyTasks.length > 0 && (
            <Section
              id="daily-title"
              icon={Repeat}
              title="Daily habits"
              right={
                <span className="font-mono text-xs text-ink-3 tabular">
                  {path.daily.done}/{path.daily.total} today
                </span>
              }
            >
              <ul className="flex flex-col gap-2">{dailyTasks.map((t) => renderTask(t))}</ul>
            </Section>
          )}

          {show("active") && (
            <Section id="quests-title" icon={ScrollText} title="Quests" right={<span className="font-mono text-xs text-ink-3">{activeQuests.length}</span>}>
              {activeQuests.length === 0 ? (
                <EmptyNote>
                  {clearedQuests.length > 0 ? "Every quest on this path is cleared. Legendary." : "No open quests."}
                </EmptyNote>
              ) : (
                <ul className="flex flex-col gap-2">{activeQuests.map((t) => renderTask(t))}</ul>
              )}
            </Section>
          )}

          {show("cleared") && (
            <Section
              id="cleared-title"
              icon={Trophy}
              title="Cleared"
              right={<span className="font-mono text-xs text-ink-3">{clearedQuests.length}</span>}
            >
              {clearedQuests.length === 0 ? (
                <EmptyNote>Nothing cleared yet — your first victory is waiting.</EmptyNote>
              ) : (
                <ul className="flex flex-col gap-2">{clearedQuests.map((t) => renderTask(t))}</ul>
              )}
            </Section>
          )}
        </div>
      )}

      {adding && (
        <TaskFormModal
          mode="add"
          accent={accent}
          pathName={category.name}
          onClose={() => setAdding(false)}
          onSubmit={addQuest}
        />
      )}
    </div>
  );
}

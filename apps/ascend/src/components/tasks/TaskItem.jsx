import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Ban,
  Check,
  ChevronDown,
  CircleDollarSign,
  Copy,
  Flame,
  ListChecks,
  Pencil,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  Repeat,
  Trash2,
  X,
} from "lucide-react";
import { checklistCount, checklistGoal, isTaskComplete } from "../../data/tasks";
import { useNotes, usePinned, useProgress } from "../../hooks/useLocalStorage";
import { useCopy } from "../../hooks/useCopy";
import { useQuestActions } from "../../hooks/useQuestActions";
import { useToast } from "../feedback/toast-context";
import CheckMark from "../ui/CheckMark";
import Menu from "../ui/Menu";
import PathIcon from "../ui/PathIcon";
import { ProgressRing } from "../ui/Progress";
import ConfirmModal from "../ConfirmModal";
import NoteModal, { NotePreview } from "./NoteModal";
import TaskFormModal from "./TaskFormModal";

// Pin key for a single checklist item (so one book can sit in Focus without
// pinning the whole "Read books" quest).
// Notes on checklist items use the same key.
const itemPinKey = (taskId, itemId) => `${taskId}::${itemId}`;

// "Add note" / "Edit note" and "Copy title" — shared by every row's menu.
function noteMenuItems({ note, onNote, onCopy }) {
  return [
    { label: note ? "Edit note" : "Add note", icon: NotebookPen, onSelect: onNote },
    { label: "Copy title", icon: Copy, onSelect: onCopy },
  ];
}

// Money quests cycle: open → cleared with profit → cleared, no profit → open.
function nextMoneyState(value) {
  if (!value) return true;
  if (value === true) return "no-profit";
  return false;
}

function Chip({ children, className = "", title }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

function Meta({ task, streak, noProfit, path, done, showDaily }) {
  const showStreak = task.daily && streak > 0;
  const dailyChip = task.daily && showDaily;
  if (!dailyChip && !showStreak && !noProfit && !path) return null;
  return (
    <span className="mt-1 flex flex-wrap items-center gap-1.5">
      {path && (
        <Chip className="text-(--accent) bg-(--accent)/10">
          <PathIcon id={path.id} className="w-3 h-3" />
          {path.name}
        </Chip>
      )}
      {dailyChip && (
        <Chip className="text-(--accent)/90 bg-(--accent)/10" title="Resets every midnight">
          <Repeat className="w-3 h-3" aria-hidden="true" />
          Daily
        </Chip>
      )}
      {showStreak && (
        <Chip
          className={done ? "text-orange-300 bg-orange-400/12" : "text-orange-300/80 bg-orange-400/8"}
          title={`${streak}-day streak`}
        >
          <Flame className={`w-3 h-3 ${done && streak >= 3 ? "animate-flame" : ""}`} aria-hidden="true" />
          {streak}
        </Chip>
      )}
      {noProfit && (
        <Chip className="text-slate-300 bg-slate-500/15" title="Cleared, but no profit made">
          <Ban className="w-3 h-3" aria-hidden="true" />
          No profit
        </Chip>
      )}
    </span>
  );
}

// One quest row. Works everywhere (path pages, Daily Quest, Focus):
//   onEdit / onDelete  — enable those menu actions (path pages)
//   path               — { id, name } shows a path chip (mixed-path lists)
//   openable           — adds "Open in path" to the menu (home)
//   showDaily          — label daily habits (lists that mix dailies with quests)
//   streak             — current streak for daily habits
export default function TaskItem({
  task,
  value,
  accent,
  categoryId,
  pinned = false,
  onTogglePin,
  onEdit,
  onDelete,
  streak = 0,
  path,
  openable = false,
  showDaily = false,
  forceOpen = false,
}) {
  const { update } = useQuestActions();
  const navigate = useNavigate();
  const [notes, setNote] = useNotes();
  const copy = useCopy();
  const [dialog, setDialog] = useState(null); // "edit" | "delete" | "note" | null
  const [open, setOpen] = useState(false);
  const checkRef = useRef(null);

  const isChecklist = task.type === "checklist";
  const done = isTaskComplete(task, value);
  // Only single quests and checklists have a UI (as before the redesign).
  const supported = isChecklist || task.type === "check";
  const isMoney = categoryId === "money";
  const noProfit = value === "no-profit";
  const expanded = isChecklist && (open || forceOpen);
  const note = notes[task.id] ?? "";

  const menuItems = [
    {
      label: pinned ? "Unpin from focus" : "Pin to focus",
      icon: pinned ? PinOff : Pin,
      onSelect: onTogglePin,
      hidden: !onTogglePin || (done && !pinned),
    },
    {
      label: "Mark as no profit",
      icon: Ban,
      onSelect: () => update(task, "no-profit", { accent }),
      hidden: !isMoney || value !== true,
    },
    {
      label: "Mark as profit",
      icon: CircleDollarSign,
      onSelect: () => update(task, true, { accent }),
      hidden: !isMoney || !noProfit,
    },
    {
      label: "Open in path",
      icon: ArrowRight,
      onSelect: () => navigate(`/${categoryId}?highlight=${encodeURIComponent(task.id)}`),
      hidden: !openable,
    },
    ...noteMenuItems({ note, onNote: () => setDialog("note"), onCopy: () => copy(task.name, "Title copied") }),
    { label: "Edit quest", icon: Pencil, onSelect: () => setDialog("edit"), hidden: !onEdit },
    { label: "Delete quest", icon: Trash2, onSelect: () => setDialog("delete"), danger: true, hidden: !onDelete },
  ];

  const count = isChecklist ? checklistCount(value) : 0;
  const goal = isChecklist ? checklistGoal(task, value) : 0;

  const toggleCheck = () => {
    const next = isMoney ? nextMoneyState(value) : !value;
    update(task, next, { anchor: checkRef.current, accent });
  };

  if (!supported) return null;

  return (
    <div
      style={{ "--accent": accent }}
      className={`group rounded-2xl border transition-colors duration-200 ${
        isChecklist
          ? `relative overflow-hidden bg-gradient-to-r from-(--accent)/[0.07] via-panel/55 to-panel/55 ${
              done ? "border-(--accent)/35" : "border-(--accent)/20 hover:border-(--accent)/40"
            }`
          : done
          ? noProfit
            ? "border-edge/70 bg-panel/35"
            : "border-(--accent)/25 bg-(--accent)/[0.04]"
          : "border-edge bg-panel/55 hover:border-edge-hi"
      }`}
    >
      {isChecklist && (
        <span
          aria-hidden="true"
          className="absolute left-0 inset-y-0 w-[3px] bg-(--accent) shadow-[0_0_12px_var(--accent)]"
          style={{ opacity: done ? 0.9 : 0.55 }}
        />
      )}
      <div className="flex items-center gap-1 pl-3 pr-1.5">
        <button
          type="button"
          onClick={isChecklist ? () => setOpen((o) => !o) : toggleCheck}
          role={isChecklist ? undefined : "checkbox"}
          aria-checked={isChecklist ? undefined : done}
          aria-expanded={isChecklist ? expanded : undefined}
          title={isMoney && !isChecklist ? "Tap to cycle: cleared → no profit → open" : undefined}
          className="flex-1 min-w-0 flex items-center gap-3 py-3 text-left min-h-[56px]"
        >
          <span ref={checkRef} className="shrink-0">
            {isChecklist ? (
              <ProgressRing value={goal ? count / goal : 0} size={34} stroke={3.5} glow={done}>
                {done ? (
                  <Check className="w-4 h-4 text-(--accent)" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <ListChecks className="w-4 h-4 text-(--accent)/80" aria-hidden="true" />
                )}
              </ProgressRing>
            ) : (
              <CheckMark state={noProfit ? "muted" : done ? "on" : "off"} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-[15px] font-medium leading-snug break-words ${
                done ? "text-ink-3 line-through decoration-ink-3/50" : "text-ink"
              }`}
            >
              {task.name}
            </span>
            {isChecklist && (
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                <ListChecks className="w-3 h-3" aria-hidden="true" />
                Checklist · {done ? "all" : count} of {goal} item{goal === 1 ? "" : "s"}
                {done ? " done" : ""}
              </span>
            )}
            <Meta task={task} streak={streak} noProfit={noProfit} path={path} done={done} showDaily={showDaily} />
          </span>
          {isChecklist && (
            <span
              className={`shrink-0 flex items-center gap-1 h-8 pl-2.5 pr-1.5 rounded-full border transition-colors ${
                expanded ? "border-(--accent)/50 bg-(--accent)/15" : "border-(--accent)/25 bg-(--accent)/[0.06]"
              }`}
            >
              <span className="font-mono text-[13px] font-bold tabular">
                <span className={done ? "text-(--accent)" : "text-ink"}>{count}</span>
                <span className="text-ink-3">/{goal}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-2 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </span>
          )}
        </button>
        {pinned && !done && (
          <Pin className="w-3.5 h-3.5 text-(--accent) shrink-0 rotate-45" aria-label="Pinned" />
        )}
        <Menu items={menuItems} label={`Actions for ${task.name}`} />
      </div>

      {isChecklist && <SegmentBar count={count} goal={goal} label={`${task.name} progress`} />}

      {note && (
        <div className={`px-3 pb-3 ${isChecklist ? "" : "-mt-1"}`}>
          <NotePreview text={note} onOpen={() => setDialog("note")} />
        </div>
      )}

      {expanded && <ChecklistBody task={task} value={value} accent={accent} />}

      {dialog === "note" && (
        <NoteModal
          title={task.name}
          note={note}
          accent={accent}
          onClose={() => setDialog(null)}
          onSave={(text) => {
            setDialog(null);
            setNote(task.id, text);
          }}
        />
      )}
      {dialog === "edit" && (
        <TaskFormModal
          mode="edit"
          task={task}
          accent={accent}
          onClose={() => setDialog(null)}
          onSubmit={(changes) => {
            setDialog(null);
            onEdit(changes);
          }}
        />
      )}
      <ConfirmModal
        open={dialog === "delete"}
        title="Delete this quest?"
        message={`“${task.name}” and its progress will be removed.`}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null);
          onDelete();
        }}
      />
    </div>
  );
}

// Checklist progress: one segment per item (a continuous bar past 24 items).
function SegmentBar({ count, goal, label }) {
  const segments = goal <= 24;
  return (
    <div
      className="px-3.5 pb-3 -mt-1"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-valuenow={count}
    >
      {segments ? (
        <div className="flex gap-[3px]">
          {Array.from({ length: goal }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < count ? "bg-(--accent) shadow-[0_0_6px_var(--accent)]" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-(--accent) shadow-[0_0_8px_var(--accent)] transition-[width] duration-500"
            style={{ width: `${(count / goal) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Expanded checklist: tick, rename, pin or remove items; add new ones.
function ChecklistBody({ task, value, accent }) {
  const { update } = useQuestActions();
  const [, setTask] = useProgress();
  const [pins, togglePin] = usePinned();
  const [notes, setNote] = useNotes();
  const copy = useCopy();
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const [noteItem, setNoteItem] = useState(null); // item whose note is open
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const items = value?.items ?? [];
  const checked = value?.checked ?? {};
  const withChanges = (next) => ({ items, checked, ...next });

  const addItem = (e) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    const id = `i_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    update(task, withChanges({ items: [...items, { id, name }] }), { accent });
    setDraft("");
  };

  const toggleItem = (id, anchor) => {
    update(task, withChanges({ checked: { ...checked, [id]: !checked[id] } }), { anchor, accent });
  };

  const removeItem = (it) => {
    const before = value;
    const nextChecked = { ...checked };
    delete nextChecked[it.id];
    const key = itemPinKey(task.id, it.id);
    if (pins[key]) togglePin(key);
    update(task, withChanges({ items: items.filter((x) => x.id !== it.id), checked: nextChecked }), { accent });
    toast({
      message: `Removed “${it.name}”`,
      icon: Trash2,
      accent: "#94a3b8",
      action: { label: "Undo", onClick: () => setTask(task.id, before) },
    });
  };

  const saveEdit = () => {
    const name = editDraft.trim();
    if (!name) return;
    update(task, withChanges({ items: items.map((it) => (it.id === editingId ? { ...it, name } : it)) }), {
      accent,
    });
    setEditingId(null);
  };

  return (
    <div className="border-t border-edge/70 px-1.5 sm:px-2 pt-1.5 pb-2.5">
      {items.length === 0 && (
        <p className="px-2 py-3 text-sm text-ink-3">No items yet — add the first one below.</p>
      )}
      <ul className="flex flex-col ml-3 pl-1.5 border-l border-(--accent)/20">
        {items.map((it) => {
          const itemDone = !!checked[it.id];
          const key = itemPinKey(task.id, it.id);
          const itemNote = notes[key] ?? "";

          if (editingId === it.id) {
            return (
              <li key={it.id} className="flex items-center gap-1.5 px-1.5 py-1.5">
                <input
                  type="text"
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  aria-label="Item name"
                  className="flex-1 min-w-0 h-10 rounded-lg border border-(--accent)/70 bg-void/70 px-3 text-sm text-ink focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Save item"
                  onClick={saveEdit}
                  disabled={!editDraft.trim()}
                  className="grid place-items-center w-10 h-10 rounded-lg text-emerald-300 hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel edit"
                  onClick={() => setEditingId(null)}
                  className="grid place-items-center w-10 h-10 rounded-lg text-ink-3 hover:text-ink hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          }

          return (
            <li key={it.id} className="rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={itemDone}
                  onClick={(e) => toggleItem(it.id, e.currentTarget.firstElementChild)}
                  className="flex-1 min-w-0 flex items-start gap-3 px-2 py-2.5 text-left"
                >
                  <span className="shrink-0 pt-px">
                    <CheckMark state={itemDone ? "on" : "off"} size={20} />
                  </span>
                  <span
                    className={`flex-1 text-sm leading-snug break-words ${
                      itemDone ? "text-ink-3 line-through decoration-ink-3/50" : "text-ink-2"
                    }`}
                  >
                    {it.name}
                  </span>
                </button>
                {pins[key] && !itemDone && (
                  <Pin className="w-3.5 h-3.5 text-(--accent) shrink-0 rotate-45" aria-label="Pinned" />
                )}
                <Menu
                  label={`Actions for ${it.name}`}
                  items={[
                    {
                      label: pins[key] ? "Unpin from focus" : "Pin to focus",
                      icon: pins[key] ? PinOff : Pin,
                      onSelect: () => togglePin(key),
                      hidden: itemDone && !pins[key],
                    },
                    ...noteMenuItems({
                      note: itemNote,
                      onNote: () => setNoteItem(it),
                      onCopy: () => copy(it.name, "Title copied"),
                    }),
                    {
                      label: "Rename",
                      icon: Pencil,
                      onSelect: () => {
                        setEditingId(it.id);
                        setEditDraft(it.name);
                      },
                    },
                    { label: "Remove", icon: Trash2, danger: true, onSelect: () => removeItem(it) },
                  ]}
                />
              </div>
              {itemNote && (
                <div className="pl-10 pr-2 pb-2">
                  <NotePreview text={itemNote} onOpen={() => setNoteItem(it)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={addItem} className="mt-1.5 flex items-center gap-2 px-1.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item…"
          aria-label={`Add an item to ${task.name}`}
          className="flex-1 min-w-0 h-10 rounded-lg border border-edge bg-void/60 px-3 text-sm text-ink placeholder:text-ink-3/70 focus:outline-none focus:border-(--accent)/60 transition-colors"
        />
        <button
          type="submit"
          aria-label="Add item"
          disabled={!draft.trim()}
          className="shrink-0 grid place-items-center w-10 h-10 rounded-lg bg-(--accent) text-void shadow-[0_0_14px_color-mix(in_oklab,var(--accent)_40%,transparent)] disabled:opacity-35 disabled:shadow-none disabled:cursor-not-allowed transition"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </form>

      {noteItem && (
        <NoteModal
          title={noteItem.name}
          context={`from ${task.name}`}
          note={notes[itemPinKey(task.id, noteItem.id)] ?? ""}
          accent={accent}
          onClose={() => setNoteItem(null)}
          onSave={(text) => {
            setNote(itemPinKey(task.id, noteItem.id), text);
            setNoteItem(null);
          }}
        />
      )}
    </div>
  );
}

// A single pinned checklist item shown in a Focus list.
export function FocusedItem({ parentTask, item, value, accent, categoryId, path, openable = false, onUnpin }) {
  const { update } = useQuestActions();
  const navigate = useNavigate();
  const [notes, setNote] = useNotes();
  const copy = useCopy();
  const [noteOpen, setNoteOpen] = useState(false);
  const checkRef = useRef(null);
  const checked = value?.checked ?? {};
  const done = !!checked[item.id];
  const noteKey = itemPinKey(parentTask.id, item.id);
  const note = notes[noteKey] ?? "";

  const toggle = () =>
    update(
      parentTask,
      { items: value?.items ?? [], checked: { ...checked, [item.id]: !done } },
      { anchor: checkRef.current, accent }
    );

  return (
    <div
      style={{ "--accent": accent }}
      className="rounded-2xl border border-edge bg-panel/55 hover:border-edge-hi transition-colors"
    >
      <div className="flex items-center gap-1 pl-3 pr-1.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          onClick={toggle}
          className="flex-1 min-w-0 flex items-center gap-3 py-3 text-left min-h-[56px]"
        >
          <span ref={checkRef} className="shrink-0">
            <CheckMark state={done ? "on" : "off"} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-snug text-ink break-words">{item.name}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {path && (
                <Chip className="text-(--accent) bg-(--accent)/10">
                  <PathIcon id={path.id} className="w-3 h-3" />
                  {path.name}
                </Chip>
              )}
              <span className="text-xs text-ink-3 truncate">from {parentTask.name}</span>
            </span>
          </span>
        </button>
        <Pin className="w-3.5 h-3.5 text-(--accent) shrink-0 rotate-45" aria-label="Pinned" />
        <Menu
          label={`Actions for ${item.name}`}
          items={[
            { label: "Unpin from focus", icon: PinOff, onSelect: onUnpin },
            ...noteMenuItems({ note, onNote: () => setNoteOpen(true), onCopy: () => copy(item.name, "Title copied") }),
            {
              label: "Open in path",
              icon: ArrowRight,
              onSelect: () =>
                navigate(`/${categoryId}?highlight=${encodeURIComponent(itemPinKey(parentTask.id, item.id))}`),
              hidden: !openable,
            },
          ]}
        />
      </div>
      {note && (
        <div className="px-3 pb-3 -mt-1">
          <NotePreview text={note} onOpen={() => setNoteOpen(true)} />
        </div>
      )}
      {noteOpen && (
        <NoteModal
          title={item.name}
          context={`from ${parentTask.name}`}
          note={note}
          accent={accent}
          onClose={() => setNoteOpen(false)}
          onSave={(text) => {
            setNote(noteKey, text);
            setNoteOpen(false);
          }}
        />
      )}
    </div>
  );
}

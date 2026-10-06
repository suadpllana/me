import { useState } from "react";
import { ListChecks, Pencil, Plus, Repeat, Square } from "lucide-react";
import Modal from "../ui/Modal";

function TypeOption({ active, onSelect, icon, label, hint }) {
  const Icon = icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`flex-1 flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
        active ? "border-(--accent)/70 bg-(--accent)/10" : "border-edge hover:border-edge-hi bg-abyss/40"
      }`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${active ? "text-(--accent)" : "text-ink-3"}`} aria-hidden="true" />
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${active ? "text-(--accent)" : "text-ink"}`}>{label}</span>
        <span className="block text-xs text-ink-3 mt-0.5 leading-snug">{hint}</span>
      </span>
    </button>
  );
}

// Create or edit a quest: name, type (single / checklist) and daily reset.
// Mounted only while open (so the form starts fresh). In edit mode, calls
// onSubmit({ name, type, daily }) only when something changed.
export default function TaskFormModal({ mode = "add", task, accent, pathName, onSubmit, onClose }) {
  const editing = mode === "edit";
  const [name, setName] = useState(task?.name ?? "");
  const [type, setType] = useState(task?.type ?? "check");
  const [daily, setDaily] = useState(!!task?.daily);

  const trimmed = name.trim();
  const dirty = editing
    ? !!trimmed && (trimmed !== task.name || type !== task.type || daily !== !!task.daily)
    : !!trimmed;

  const submit = (e) => {
    e?.preventDefault();
    if (!dirty) return;
    onSubmit({ name: trimmed, type, daily });
  };

  return (
    <Modal
      open
      onClose={onClose}
      accent={accent}
      icon={editing ? Pencil : Plus}
      title={editing ? "Edit quest" : "New quest"}
      description={editing ? undefined : pathName ? `Add a quest to the ${pathName} path.` : undefined}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-xl text-sm font-semibold text-ink-2 hover:text-ink hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={!dirty}
            className="h-11 px-5 rounded-xl font-display text-sm font-bold tracking-wide bg-(--accent) text-void shadow-[0_0_20px_color-mix(in_oklab,var(--accent)_40%,transparent)] hover:brightness-110 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition"
          >
            {editing ? "Save changes" : "Add quest"}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="task-name" className="sys-title text-[11px] block mb-2">
            Name
          </label>
          <input
            id="task-name"
            data-autofocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 20 pages"
            autoComplete="off"
            className="w-full h-12 rounded-xl border border-edge bg-void/70 px-3.5 text-[15px] text-ink placeholder:text-ink-3/70 focus:outline-none focus:border-(--accent)/70 transition-colors"
          />
        </div>

        <div role="radiogroup" aria-label="Quest type">
          <p className="sys-title text-[11px] mb-2">Type</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <TypeOption
              active={type === "check"}
              onSelect={() => setType("check")}
              icon={Square}
              label="Single quest"
              hint="Done or not done"
            />
            <TypeOption
              active={type === "checklist"}
              onSelect={() => setType("checklist")}
              icon={ListChecks}
              label="Checklist"
              hint="Tick off sub-items one by one"
            />
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={daily}
          onClick={() => setDaily((d) => !d)}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
            daily ? "border-(--accent)/70 bg-(--accent)/10" : "border-edge hover:border-edge-hi bg-abyss/40"
          }`}
        >
          <Repeat className={`w-5 h-5 shrink-0 ${daily ? "text-(--accent)" : "text-ink-3"}`} aria-hidden="true" />
          <span className="flex-1 min-w-0">
            <span className={`block text-sm font-semibold ${daily ? "text-(--accent)" : "text-ink"}`}>Daily habit</span>
            <span className="block text-xs text-ink-3 mt-0.5">Resets every midnight and joins the Daily Quest</span>
          </span>
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              daily ? "bg-(--accent)" : "bg-white/15"
            }`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: daily ? "translateX(22px)" : "translateX(2px)" }}
            />
          </span>
        </button>

        {editing && type !== task.type && (
          <p className="text-xs text-amber-300/90 leading-snug -mt-1">
            Changing the type resets this quest&apos;s progress.
          </p>
        )}
      </form>
    </Modal>
  );
}

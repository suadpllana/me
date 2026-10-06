import { useState } from "react";
import { Copy, NotebookPen, StickyNote, Trash2 } from "lucide-react";
import { useCopy } from "../../hooks/useCopy";
import Modal from "../ui/Modal";

export const NOTE_MAX = 5000;

// Write or edit the note on a quest or checklist item — thoughts on a movie,
// takeaways from a video, a game review. Mounted only while open.
//   title    — the quest / item name (copyable from here too)
//   context  — optional line under the title, e.g. "from Watch movies"
//   onSave(text) — called with the trimmed note ("" clears it)
export default function NoteModal({ title, context, note = "", accent, onSave, onClose }) {
  const copy = useCopy();
  const [draft, setDraft] = useState(note);
  const trimmed = draft.trim();
  const dirty = trimmed !== note.trim();

  const save = (e) => {
    e?.preventDefault();
    if (dirty) onSave(trimmed);
    else onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      accent={accent}
      icon={NotebookPen}
      size="lg"
      title={title}
      description={context}
      footer={
        <>
          {note && (
            <button
              type="button"
              onClick={() => onSave("")}
              className="mr-auto inline-flex items-center gap-2 h-11 px-3 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Delete note
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-xl text-sm font-semibold text-ink-2 hover:text-ink hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="note-form"
            disabled={!dirty}
            className="h-11 px-5 rounded-xl font-display text-sm font-bold tracking-wide bg-(--accent) text-void shadow-[0_0_20px_color-mix(in_oklab,var(--accent)_40%,transparent)] hover:brightness-110 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition"
          >
            Save note
          </button>
        </>
      }
    >
      <form id="note-form" onSubmit={save} className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="note-text" className="sys-title text-[11px] inline-flex items-center gap-1.5">
            <StickyNote className="w-3 h-3" aria-hidden="true" />
            Note
          </label>
          <button
            type="button"
            onClick={() => copy(title, "Title copied")}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold text-ink-2 hover:text-ink hover:bg-white/[0.06] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            Copy title
          </button>
        </div>
        <textarea
          id="note-text"
          data-autofocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save(e);
          }}
          maxLength={NOTE_MAX}
          rows={8}
          placeholder="What did you think? Takeaways, favourite moments, a rating…"
          className="w-full min-h-40 resize-y rounded-xl border border-edge bg-void/70 px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-3/70 focus:outline-none focus:border-(--accent)/70 transition-colors"
        />
        <p className="text-right text-[11px] text-ink-3 tabular">
          {draft.length.toLocaleString()} / {NOTE_MAX.toLocaleString()}
        </p>
      </form>
    </Modal>
  );
}

// A note shown under its quest / item; tap to open the editor.
export function NotePreview({ text, onOpen, className = "" }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Edit note"
      className={`w-full flex items-start gap-2 rounded-lg border border-(--accent)/15 bg-(--accent)/[0.04] px-2.5 py-2 text-left hover:border-(--accent)/35 transition-colors ${className}`}
    >
      <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-(--accent)/80" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink-2 whitespace-pre-wrap break-words line-clamp-3">
        <span className="sr-only">Edit note: </span>
        {text}
      </span>
    </button>
  );
}

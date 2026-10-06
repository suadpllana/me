import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { ToastContext } from "./toast-context";

const MAX_VISIBLE = 3;

function normalize(input, variant) {
  if (typeof input === "string") {
    return { message: input, tone: variant === "error" ? "error" : "success" };
  }
  return { tone: "success", ...input };
}

// System-styled notifications. Sit above the phone bottom nav, stack up to
// three, and can carry an action (e.g. Undo) that keeps them up longer.
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input, variant) => {
      const t = { ...normalize(input, variant), id: ++idRef.current };
      setToasts((prev) => [...prev, t].slice(-MAX_VISIBLE));
      const ms = t.duration ?? (t.action ? 5000 : 2800);
      timers.current.set(t.id, setTimeout(() => dismiss(t.id), ms));
    },
    [dismiss]
  );

  // Clear any pending dismissal timers if the provider unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4 pointer-events-none bottom-[calc(var(--nav-h)+var(--safe-bottom)+12px)] lg:bottom-6 lg:pl-[272px]"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const error = toast.tone === "error";
  const accent = error ? "#f87171" : toast.accent ?? "#4da3ff";
  const Icon = toast.icon ?? (error ? CircleAlert : CircleCheck);

  return (
    <div
      role={error ? "alert" : "status"}
      className="pointer-events-auto w-full max-w-sm sys-panel sys-edge rounded-2xl bg-panel/90 flex items-center gap-3 pl-3 pr-2 py-2.5 animate-pop"
      style={{ "--accent": accent }}
    >
      <div className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-(--accent)/15 text-(--accent)">
        <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-(--accent) leading-none mb-1">
            {toast.title}
          </p>
        )}
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{toast.message}</p>
      </div>
      {toast.xp > 0 && (
        <span className="shrink-0 font-display text-sm font-bold text-(--accent) tabular">+{toast.xp} XP</span>
      )}
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick();
            onDismiss();
          }}
          className="shrink-0 h-9 px-3 rounded-lg font-display text-sm font-semibold text-ink hover:bg-white/[0.08] border border-edge-hi/60 transition-colors"
        >
          {toast.action.label}
        </button>
      ) : (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-ink-3 hover:text-ink hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

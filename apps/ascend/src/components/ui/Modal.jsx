import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";

const FOCUSABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// Dialog on desktop, bottom sheet on phones. Traps focus while open, closes
// on Escape / backdrop tap, and returns focus to whatever opened it. Mark the
// element that should receive initial focus with `data-autofocus`.
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  accent,
  tone,
  children,
  footer,
  size = "md",
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descId = useId();
  useScrollLock(open);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const target = panel?.querySelector("[data-autofocus]") ?? panel?.querySelector(FOCUSABLE) ?? panel;
    target?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const list = [...panel.querySelectorAll(FOCUSABLE)];
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const maxW = size === "sm" ? "sm:max-w-sm" : size === "lg" ? "sm:max-w-lg" : "sm:max-w-md";
  const iconTone =
    tone === "danger"
      ? "bg-red-500/15 text-red-400 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.3)]"
      : "bg-(--accent)/15 text-(--accent) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_35%,transparent)]";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      style={accent ? { "--accent": accent } : undefined}
    >
      <div className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-sm animate-fade" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`sys-panel sys-edge relative w-full ${maxW} max-h-[92dvh] overflow-y-auto outline-none rounded-b-none sm:rounded-[18px] animate-sheet sm:animate-pop px-5 pt-3 sm:pt-5 pb-[calc(1.25rem+var(--safe-bottom))] sm:pb-5 bg-panel`}
      >
        {/* grab handle (phones) */}
        <div className="sm:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />

        {(title || Icon) && (
          <div className="flex items-start gap-3 pr-9">
            {Icon && (
              <div className={`shrink-0 grid place-items-center w-10 h-10 rounded-xl ${iconTone}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 pt-0.5">
              {title && (
                <h3 id={titleId} className="font-display text-lg font-bold leading-tight text-ink">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="mt-1 text-sm text-ink-2 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 sm:top-4 grid place-items-center w-9 h-9 rounded-lg text-ink-3 hover:text-ink hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        {children != null && <div className={title || Icon ? "mt-4" : ""}>{children}</div>}
        {footer && <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

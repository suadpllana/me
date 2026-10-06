import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Flame, ShieldCheck } from "lucide-react";

// Top-of-screen "[System] Daily Quest complete" notice with a celebratory
// burst. Auto-dismisses; tap to close early.
export default function SystemBanner({ banner, burst, onClose }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const t1 = setTimeout(() => burst(ref.current, { color: "#4da3ff", big: true }), 150);
    const t2 = setTimeout(() => onCloseRef.current(), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [burst]);

  return createPortal(
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+12px)] z-[125] flex justify-center px-4 pointer-events-none lg:pl-[272px]">
      <button
        ref={ref}
        type="button"
        role="status"
        onClick={onClose}
        className="pointer-events-auto sys-panel sys-edge sys-brackets bg-panel/95 w-full max-w-md flex items-center gap-4 px-4 py-3.5 text-left animate-drop"
        style={{ "--accent": "#4da3ff" }}
      >
        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-system/15 text-system shadow-[0_0_24px_rgba(77,163,255,0.35)]">
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="sys-title text-system text-[11px]">[ System ] Daily Quest</p>
          <p className="font-display text-lg font-bold text-ink leading-tight mt-0.5">
            Complete — all {banner.total} habits cleared
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
            <Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />
            {banner.streak}-day streak · penalty zone avoided
          </p>
        </div>
      </button>
    </div>,
    document.body
  );
}

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronsRight } from "lucide-react";
import RankEmblem from "../ui/RankEmblem";
import { nextRank } from "../../data/game";

const article = (id) => (["A", "E", "S"].includes(id) ? "an" : "a");

// Full-screen "LEVEL UP!" moment. Tap anywhere, press Escape/Enter, or hit
// Continue to dismiss.
export default function LevelUpOverlay({ from, to, rank, rankUp, burst, onClose }) {
  const buttonRef = useRef(null);
  const emblemRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const timer = setTimeout(() => burst(emblemRef.current, { color: rank.color, big: true }), 350);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [burst, rank.color]);

  const upcoming = nextRank(rank);

  return createPortal(
    <div
      className="fixed inset-0 z-[140] grid place-items-center p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
      style={{ "--accent": rank.color }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#02040a]/85 backdrop-blur-md animate-fade" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[160vmax] h-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-60"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, color-mix(in oklab, var(--accent) 16%, transparent) 0deg 6deg, transparent 6deg 22deg)",
          maskImage: "radial-gradient(circle, black 0%, transparent 38%)",
          WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 38%)",
          animation: "spin-slow 40s linear infinite",
        }}
      />

      <div
        className="relative sys-panel sys-edge sys-brackets w-full max-w-sm text-center px-6 pt-6 pb-5 animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="sys-title text-(--accent)">[ System notification ]</p>
        <h2
          id="level-up-title"
          className="mt-3 font-brand text-[40px] leading-none font-black italic shimmer-text"
          style={{ animation: "level-in 0.9s var(--ease-out-expo) both, shimmer 3s linear infinite" }}
        >
          LEVEL UP!
        </h2>

        <div className="mt-6 flex items-center justify-center gap-5">
          <div className="text-ink-3">
            <div className="sys-title text-[10px]">Level</div>
            <div className="font-display text-3xl font-bold tabular">{from}</div>
          </div>
          <ChevronsRight className="w-7 h-7 text-(--accent) animate-pulse" aria-hidden="true" />
          <div>
            <div className="sys-title text-[10px] text-(--accent)">Level</div>
            <div className="font-display text-5xl font-bold tabular text-white text-glow">{to}</div>
          </div>
        </div>

        <div ref={emblemRef} className="mt-6 flex flex-col items-center gap-3">
          <RankEmblem rank={rank} size={rankUp ? 88 : 64} />
          {rankUp ? (
            <p className="text-sm text-ink-2 leading-snug">
              <span className="block font-display text-base font-bold uppercase tracking-[0.12em] text-(--accent)">
                Rank up!
              </span>
              You are now {article(rank.id)} {rank.id}-Rank <span className="text-ink font-semibold">{rank.title}</span>.
            </p>
          ) : (
            <p className="text-sm text-ink-2 leading-snug">
              Your attributes grow stronger.
              {upcoming ? (
                <>
                  {" "}
                  {upcoming.id}-Rank unlocks at <span className="text-ink font-semibold">Lv {upcoming.minLevel}</span>.
                </>
              ) : (
                " You stand at the peak."
              )}
            </p>
          )}
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-12 rounded-xl bg-(--accent) text-void font-display text-base font-bold tracking-wider uppercase shadow-[0_0_28px_color-mix(in_oklab,var(--accent)_55%,transparent)] hover:brightness-110 transition"
        >
          Continue
        </button>
      </div>
    </div>,
    document.body
  );
}

import { useCallback, useMemo, useRef, useState } from "react";
import { useGame } from "../../hooks/game-context";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { rankForLevel } from "../../data/game";
import { FxContext } from "./fx-context";
import LevelUpOverlay from "./LevelUpOverlay";
import SystemBanner from "./SystemBanner";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Owns every "moment" in the app:
//   • burst(): particle burst + floating "+XP" on the element that was clicked
//     (plain DOM nodes, no React re-render)
//   • the LEVEL UP overlay and the DAILY QUEST COMPLETE banner, detected by
//     comparing the derived game state with the previous render — so they
//     fire however the change happened (click, undo, another device syncing).
export default function FxProvider({ children }) {
  const game = useGame();
  const layerRef = useRef(null);

  const burst = useCallback((anchor, { color = "#4da3ff", text, big = false } = {}) => {
    const layer = layerRef.current;
    if (!layer || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const nodes = [];
    const make = (className, left, top, vars) => {
      const el = document.createElement("div");
      el.className = className;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
      nodes.push(el);
      return el;
    };

    if (!prefersReducedMotion()) {
      make("fx-ring", x, y, { "--c": color });
      const count = big ? 26 : 14;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
        const dist = (big ? 70 : 30) + Math.random() * (big ? 70 : 26);
        make("fx-particle", x, y, {
          "--c": color,
          "--dx": `${Math.cos(angle) * dist}px`,
          "--dy": `${Math.sin(angle) * dist}px`,
          "--s": `${3 + Math.random() * (big ? 5 : 3.5)}px`,
        });
      }
    }
    if (text) make("fx-xp", x, y - 18, { "--c": color }).textContent = text;

    for (const el of nodes) {
      el.addEventListener("animationend", () => el.remove(), { once: true });
      layer.appendChild(el);
    }
    // Safety net in case an animationend never fires (e.g. tab hidden).
    setTimeout(() => nodes.forEach((el) => el.remove()), 1800);
  }, []);

  // ── Level up detection ──
  // The highest level ever celebrated is remembered on this device, so
  // un-checking and re-checking a task never replays the same level-up.
  const level = game.xp.level;
  const [initialLevel] = useState(level);
  const [maxLevel, setMaxLevel] = useLocalStorage("ascend-max-level", null);
  const [prevLevel, setPrevLevel] = useState(level);
  const [levelUp, setLevelUp] = useState(null);
  if (level !== prevLevel) {
    setPrevLevel(level);
    const best = maxLevel ?? initialLevel;
    if (level > best) {
      setMaxLevel(level);
      // One action is worth at most one level (the biggest award is 65 XP),
      // so a bigger jump means synced / loaded data — record it silently
      // rather than celebrate "Lv 1 → 25" on a freshly connected device.
      if (level - prevLevel <= 2) {
        setLevelUp({
          from: best,
          to: level,
          rank: rankForLevel(level),
          rankUp: rankForLevel(level).id !== rankForLevel(best).id,
        });
      }
    }
  }

  // ── Daily Quest completion detection ──
  const allDailiesDone = game.daily.total > 0 && game.daily.done >= game.daily.total;
  const [prevAllDone, setPrevAllDone] = useState(allDailiesDone);
  const [banner, setBanner] = useState(null);
  if (allDailiesDone !== prevAllDone) {
    setPrevAllDone(allDailiesDone);
    if (allDailiesDone) {
      setBanner((b) => ({
        id: (b?.id ?? 0) + 1,
        total: game.daily.total,
        streak: game.streak.current,
      }));
    }
  }

  const value = useMemo(() => ({ burst }), [burst]);

  return (
    <FxContext.Provider value={value}>
      {children}
      <div ref={layerRef} className="fixed inset-0 pointer-events-none z-[130]" aria-hidden="true" />
      {banner && (
        <SystemBanner key={banner.id} banner={banner} burst={burst} onClose={() => setBanner(null)} />
      )}
      {levelUp && <LevelUpOverlay {...levelUp} burst={burst} onClose={() => setLevelUp(null)} />}
    </FxContext.Provider>
  );
}

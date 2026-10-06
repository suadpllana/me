import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ellipsis } from "lucide-react";

// Where to put the menu for a trigger: below it (right-aligned), or above
// when there's no room below. Null when the trigger has left the viewport.
function placeMenu(trigger, itemCount) {
  const r = trigger.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return null;
  const estimated = itemCount * 44 + 12;
  const below = window.innerHeight - r.bottom;
  const right = Math.max(8, window.innerWidth - r.right);
  return below < estimated + 12 && r.top > below
    ? { bottom: window.innerHeight - r.top + 6, right }
    : { top: r.bottom + 6, right };
}

// Overflow "⋯" menu. Renders into <body> with fixed positioning so it's never
// clipped, flips above the trigger when there's no room below, follows the
// trigger while the page scrolls, and supports Escape / arrow-key navigation.
//   items: [{ label, icon, onSelect, danger?, disabled?, hidden? }]
export default function Menu({ items, label = "More actions", className = "" }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const visible = items.filter((i) => !i.hidden);
  const open = !!pos;
  const count = visible.length;

  const openMenu = (e) => {
    e.stopPropagation();
    setPos(placeMenu(e.currentTarget, count));
  };

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const buttons = () => [...(menu?.querySelectorAll("button:not(:disabled)") ?? [])];
    buttons()[0]?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setPos(null);
        btnRef.current?.focus();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const list = buttons();
        const i = list.indexOf(document.activeElement);
        const next = e.key === "ArrowDown" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
        list[next]?.focus();
      } else if (e.key === "Tab") {
        setPos(null);
      }
    };
    // Stay anchored to the trigger while the page scrolls or resizes (iOS
    // resizes the viewport as its toolbars collapse); close once it's gone.
    const follow = () => setPos(btnRef.current ? placeMenu(btnRef.current, count) : null);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", follow);
    window.addEventListener("scroll", follow, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", follow);
      window.removeEventListener("scroll", follow, true);
    };
  }, [open, count]);

  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={openMenu}
        className={`shrink-0 grid place-items-center w-9 h-9 rounded-lg text-ink-3 hover:text-ink hover:bg-white/[0.06] transition-colors ${
          pos ? "bg-white/[0.06] text-ink" : ""
        } ${className}`}
      >
        <Ellipsis className="w-[18px] h-[18px]" />
      </button>
      {pos &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[110]"
              onClick={(e) => {
                e.stopPropagation();
                setPos(null);
              }}
            />
            <div
              ref={menuRef}
              role="menu"
              aria-label={label}
              className="fixed z-[111] min-w-52 p-1.5 rounded-xl border border-edge-hi/70 bg-panel/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] animate-pop"
              style={pos}
            >
              {visible.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Hand focus back to the trigger first so a dialog opened
                      // by this item can restore it when it closes.
                      btnRef.current?.focus({ preventScroll: true });
                      setPos(null);
                      item.onSelect();
                    }}
                    className={`w-full flex items-center gap-3 h-11 px-3 rounded-lg text-left text-sm font-medium transition-colors disabled:opacity-40 ${
                      item.danger
                        ? "text-red-300 hover:bg-red-500/10 focus-visible:bg-red-500/10"
                        : "text-ink hover:bg-white/[0.06] focus-visible:bg-white/[0.06]"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 ${item.danger ? "text-red-400" : "text-ink-3"}`}
                        aria-hidden="true"
                      />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

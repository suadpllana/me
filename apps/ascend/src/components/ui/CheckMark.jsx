// Visual checkbox (the clickable element is its parent button/row).
//   state: "off" | "on" | "muted"   ("muted" = done but greyed, e.g. no-profit)
// The check glyph only mounts while checked, so its pop + draw-in animation
// replays every time the box gets checked.
export default function CheckMark({ state = "off", size = 22, className = "" }) {
  const on = state === "on";
  const muted = state === "muted";
  return (
    <span
      aria-hidden="true"
      className={`relative shrink-0 grid place-items-center rounded-[7px] border-2 transition-[background-color,border-color,box-shadow] duration-200 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: on ? "var(--accent)" : muted ? "rgba(120,135,170,0.6)" : "rgba(170,190,240,0.3)",
        background: on ? "var(--accent)" : muted ? "rgba(100,116,139,0.35)" : "rgba(255,255,255,0.02)",
        boxShadow: on ? "0 0 14px color-mix(in oklab, var(--accent) 55%, transparent)" : "none",
      }}
    >
      {(on || muted) && (
        <svg
          viewBox="0 0 24 24"
          className="w-[70%] h-[70%] check-anim"
          fill="none"
          stroke={muted ? "rgba(203,213,225,0.9)" : "#04060d"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
  );
}

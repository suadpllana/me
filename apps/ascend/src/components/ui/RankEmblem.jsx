import { useId } from "react";

// Hexagonal hunter-rank crest with the rank letter (E … S) in the center.
const HEX = "50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27";
const HEX_INNER = "50,14 81.2,32 81.2,68 50,86 18.8,68 18.8,32";

export default function RankEmblem({ rank, size = 64, className = "" }) {
  // Unique per instance: a duplicate id inside a hidden (display:none) copy,
  // e.g. the desktop sidebar on phones, would break this gradient.
  const gid = `rank-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div
      className={`relative shrink-0 grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${rank.id}-Rank`}
    >
      <div className="absolute inset-[12%]" style={{ opacity: 0.45 }} aria-hidden="true">
        <div className="w-full h-full rounded-full blur-xl glow-pulse" style={{ background: rank.color }} />
      </div>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor={rank.color} />
            <stop offset="100%" stopColor={rank.color} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <polygon points={HEX} fill="rgba(6,10,22,0.85)" stroke={`url(#${gid})`} strokeWidth="3.5" strokeLinejoin="round" />
        <polygon points={HEX_INNER} fill="none" stroke={rank.color} strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span
        className="relative font-brand font-black italic leading-none"
        style={{
          fontSize: size * 0.42,
          color: rank.color,
          textShadow: `0 0 ${size * 0.2}px ${rank.color}`,
        }}
      >
        {rank.id}
      </span>
    </div>
  );
}

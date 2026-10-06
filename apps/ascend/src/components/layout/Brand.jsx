import { Link } from "react-router-dom";

// The "AD" mark + Ascend! wordmark.
export default function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Ascend! — home">
      <span className="relative grid place-items-center w-9 h-9 rounded-[11px] border border-white/10 bg-[#0a0a12] shrink-0">
        <span
          className="font-brand font-black italic text-[15px] leading-none bg-gradient-to-br from-[#00e5ff] to-[#8b5cf6] bg-clip-text text-transparent"
          aria-hidden="true"
        >
          AD
        </span>
        <span
          className="absolute inset-0 rounded-[11px] glow-pulse shadow-[0_0_18px_rgba(0,229,255,0.35)]"
          aria-hidden="true"
        />
      </span>
      {!compact && (
        <span className="font-brand font-black uppercase italic tracking-[0.06em] text-[17px] text-white leading-none whitespace-nowrap group-hover:text-system-hi transition-colors">
          Ascend!
        </span>
      )}
    </Link>
  );
}

import { DEADLINE_DATE, DEADLINE_LABEL } from "../data/tasks";
import { useNowMinute, useNowSecond } from "../hooks/useClock";

const TARGET = new Date(DEADLINE_DATE).getTime();
const SHORT_LABEL = new Date(DEADLINE_DATE).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function split(now) {
  const ms = Math.max(0, TARGET - now);
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
    done: ms === 0,
  };
}

const pad = (n) => String(n).padStart(2, "0");

// Big days number + a live hh:mm:ss ticker (re-renders once per second, so
// it's kept to this small component).
export function DeadlineCountdown({ className = "" }) {
  const t = split(useNowSecond());
  return (
    <div className={className}>
      <p className="sys-title text-[11px]">{t.done ? "Deadline reached" : `Until ${DEADLINE_LABEL}`}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-white tabular leading-none">{t.days}</span>
        <span className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-2">days</span>
      </div>
      <p className="mt-1.5 font-mono text-sm text-ink-3 tabular" aria-label="hours, minutes and seconds">
        {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
      </p>
    </div>
  );
}

// One-line "277 days left" label (updates once a minute).
export function DaysLeft({ className = "" }) {
  const t = split(useNowMinute());
  return (
    <span className={className}>
      {t.done ? "Deadline reached" : `${t.days} days to ${SHORT_LABEL}`}
    </span>
  );
}

// Time left until the local midnight reset, "5h 12m" (updates each minute).
export function ResetTimer({ className = "" }) {
  const now = useNowMinute();
  const d = new Date(now);
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  const mins = Math.max(0, Math.ceil((midnight - now) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return <span className={className}>{h > 0 ? `${h}h ${pad(m)}m` : `${m}m`}</span>;
}

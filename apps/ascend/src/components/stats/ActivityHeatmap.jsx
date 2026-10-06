import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { parseDayKey, shiftDay } from "../../data/game";
import Panel, { PanelTitle } from "../ui/Panel";
import Segmented from "../ui/Segmented";

const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const fmtLong = (key) =>
  parseDayKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtMonth = (date) => date.toLocaleDateString("en-GB", { month: "short" });
const fmtShort = (key) => parseDayKey(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Sequential blue ramp (validated: monotone, single hue, visible steps on the
// panel surface). Level 0 = no activity, a faint surface step.
const LEVELS = ["var(--viz-empty)", "var(--viz-seq-1)", "var(--viz-seq-2)", "var(--viz-seq-3)", "var(--viz-seq-4)"];

// GitHub-style calendar of clears per day. Click or arrow-key through days to
// open them in the day detail; hover/focus shows the day's numbers; the
// Table view lists every value without needing the chart.
export default function ActivityHeatmap({ days, selected, onSelect, today }) {
  const [view, setView] = useState("chart");
  const [tip, setTip] = useState(null);
  const cardRef = useRef(null);
  const scrollRef = useRef(null);
  const gridRef = useRef(null);
  const firstKey = days[0].key;

  // Start scrolled to the most recent weeks (matters on narrow screens).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [view]);

  const byKey = new Map(days.map((d) => [d.key, d]));
  const max = Math.max(1, ...days.map((d) => d.total));
  const level = (t) => (t === 0 ? 0 : Math.min(4, Math.ceil((t / max) * 4)));

  // Columns = weeks (Mon → Sun), padded before the first day.
  const lead = (parseDayKey(firstKey).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  // Label the week in which each month starts, keeping labels at least three
  // columns apart so they never collide. The first column names the partial
  // month the calendar opens in, and gives way if a new month starts right
  // after it.
  const monthLabels = weeks.map(() => "");
  let lastLabelAt = -99;
  weeks.forEach((week, i) => {
    const firstReal = week.find(Boolean);
    const starts = week.find((d) => d && parseDayKey(d.key).getDate() === 1);
    const date = starts ? parseDayKey(starts.key) : i === 0 && firstReal ? parseDayKey(firstReal.key) : null;
    if (!date) return;
    if (i - lastLabelAt < 3) {
      if (lastLabelAt !== 0 || !starts) return;
      monthLabels[0] = "";
    }
    monthLabels[i] = fmtMonth(date);
    lastLabelAt = i;
  });

  // Summary beside the calendar.
  const best = days.reduce((b, d) => (d.total > b.total ? d : b), days[0]);
  // Average from the first logged day, so days before logging began don't
  // drag it down.
  const firstActive = days.findIndex((d) => d.total > 0);
  const logged = firstActive === -1 ? [] : days.slice(firstActive);
  const average = logged.length ? logged.reduce((n, d) => n + d.total, 0) / logged.length : 0;
  const weekStart = shiftDay(today, -((parseDayKey(today).getDay() + 6) % 7));
  const thisWeek = days.filter((d) => d.key >= weekStart).reduce((n, d) => n + d.total, 0);

  const showTip = (el, key) => {
    const card = cardRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!card) return;
    const x = Math.min(Math.max(r.left - card.left + r.width / 2, 96), card.width - 96);
    setTip({ key, x, y: r.top - card.top });
  };

  const move = (e) => {
    const deltas = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    if (!(e.key in deltas)) return;
    e.preventDefault();
    let next = shiftDay(selected, deltas[e.key]);
    if (next < firstKey) next = firstKey;
    if (next > today) next = today;
    onSelect(next);
    requestAnimationFrame(() => gridRef.current?.querySelector(`[data-key="${next}"]`)?.focus());
  };

  const tipDay = tip && byKey.get(tip.key);

  return (
    <Panel ref={cardRef} flat accent="#3987e5" className="p-4 sm:p-5" aria-labelledby="activity-title">
      <PanelTitle
        id="activity-title"
        icon={CalendarDays}
        right={
          <Segmented
            value={view}
            onChange={setView}
            label="Activity view"
            options={[
              { value: "chart", label: "Chart" },
              { value: "table", label: "Table" },
            ]}
          />
        }
      >
        Activity
      </PanelTitle>
      <p className="mt-1 text-sm text-ink-3">Quests and habits cleared per day since the journey began.</p>

      {view === "chart" ? (
        <>
          <div className="mt-4 flex flex-col lg:flex-row gap-5 lg:items-start">
            <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
              <div
                ref={gridRef}
                role="grid"
                aria-label="Daily activity calendar. Use arrow keys to move between days."
                onKeyDown={move}
                className="grid gap-[3px] w-full"
                style={{
                  gridTemplateColumns: `max-content repeat(${weeks.length}, minmax(13px, 22px))`,
                  gridTemplateRows: "auto repeat(7, auto)",
                  justifyContent: "start",
                  minWidth: "min-content",
                }}
              >
                {weeks.map((_, c) =>
                  monthLabels[c] ? (
                    <span
                      key={`m-${c}`}
                      aria-hidden="true"
                      className="text-[10px] text-ink-3 whitespace-nowrap leading-none pb-1"
                      style={{ gridRow: 1, gridColumn: c + 2 }}
                    >
                      {monthLabels[c]}
                    </span>
                  ) : null
                )}
                {WEEKDAYS.map((d, r) => (
                  <span
                    key={`w-${r}`}
                    aria-hidden="true"
                    className="text-[10px] text-ink-3 pr-1.5 self-center leading-none"
                    style={{ gridRow: r + 2, gridColumn: 1 }}
                  >
                    {d}
                  </span>
                ))}
                {cells.map((d, i) =>
                  d ? (
                    <button
                      key={d.key}
                      type="button"
                      role="gridcell"
                      data-key={d.key}
                      tabIndex={d.key === selected ? 0 : -1}
                      aria-selected={d.key === selected}
                      aria-label={`${fmtLong(d.key)}: ${d.total} clears (${d.daily} habits, ${d.oneTime} quests)`}
                      onClick={() => onSelect(d.key)}
                      onPointerEnter={(e) => showTip(e.currentTarget, d.key)}
                      onPointerLeave={() => setTip(null)}
                      onFocus={(e) => showTip(e.currentTarget, d.key)}
                      onBlur={() => setTip(null)}
                      className={`w-full aspect-square rounded-[3px] transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none ${
                        d.key === selected
                          ? "ring-2 ring-white ring-offset-1 ring-offset-panel"
                          : d.key === today
                          ? "ring-1 ring-ink-2"
                          : ""
                      }`}
                      style={{
                        background: LEVELS[level(d.total)],
                        gridRow: (i % 7) + 2,
                        gridColumn: Math.floor(i / 7) + 2,
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>

            <dl className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:w-44 shrink-0">
              {[
                ["Best day", best.total, best.total ? fmtShort(best.key) : "—"],
                ["Daily average", average.toFixed(1), "clears per logged day"],
                ["This week", thisWeek, "since Monday"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-xl border border-edge/80 bg-abyss/50 px-3 py-2.5 min-w-0">
                  <dt className="text-[11px] text-ink-3 truncate">{label}</dt>
                  <dd className="mt-0.5 font-display text-xl font-bold text-ink leading-tight">{value}</dd>
                  <dd className="text-[11px] text-ink-3 truncate">{note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-3">
            <span>Tap a day to see what you cleared.</span>
            <span className="flex items-center gap-1.5" aria-label="Color scale: fewer to more clears">
              Less
              {LEVELS.map((c, i) => (
                <span key={i} className="w-[11px] h-[11px] rounded-[3px]" style={{ background: c }} />
              ))}
              More
            </span>
          </div>

          {tipDay && (
            <div
              role="tooltip"
              className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none rounded-xl border border-edge-hi/70 bg-panel/95 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)] whitespace-nowrap"
              style={{ left: tip.x, top: tip.y - 8 }}
            >
              <p className="text-sm font-semibold text-ink">
                {tipDay.total} clear{tipDay.total === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-ink-2">
                {tipDay.daily} habits · {tipDay.oneTime} quests
              </p>
              <p className="text-[11px] text-ink-3 mt-0.5">{fmtLong(tipDay.key)}</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-edge">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-panel text-ink-3 text-xs">
              <tr>
                <th scope="col" className="text-left font-medium px-3 py-2">Date</th>
                <th scope="col" className="text-right font-medium px-3 py-2">Habits</th>
                <th scope="col" className="text-right font-medium px-3 py-2">Quests</th>
                <th scope="col" className="text-right font-medium px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr
                  key={d.key}
                  onClick={() => onSelect(d.key)}
                  className={`border-t border-edge/60 cursor-pointer hover:bg-white/[0.03] ${
                    d.key === selected ? "bg-system/10" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-ink-2">{fmtLong(d.key)}</td>
                  <td className="px-3 py-2 text-right tabular text-ink-2">{d.daily}</td>
                  <td className="px-3 py-2 text-right tabular text-ink-2">{d.oneTime}</td>
                  <td className="px-3 py-2 text-right tabular font-semibold text-ink">{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

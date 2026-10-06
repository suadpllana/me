// ── GAME LAYER ──
// Levels, XP, ranks, attributes and streaks. Everything here is DERIVED from
// the existing synced app state (progress, completion history, task
// definitions) — nothing new is stored or synced, so every device computes
// the exact same numbers and they can never drift apart.
import { CATEGORIES, dayKey, isTaskComplete, mergeCategoryTasks, taskUnitCount } from "./tasks.js";

// XP awarded per action. Daily clears come from the completion history (so
// past days are permanent); one-time quests and checklist items come from the
// current progress (so un-checking something takes its XP back).
export const XP_RULES = {
  daily: 10, // each daily habit cleared, per day
  item: 15, // each item checked in a one-time checklist
  quest: 50, // a one-time quest fully cleared
};

// Each path trains one attribute, Solo Leveling style.
export const ATTRIBUTES = {
  religion: { short: "FTH", name: "Faith" },
  money: { short: "WLT", name: "Wealth" },
  mind: { short: "INT", name: "Intellect" },
  body: { short: "STR", name: "Strength" },
  wishlist: { short: "LCK", name: "Luck" },
};

// Hunter ranks, gated by level.
export const RANKS = [
  { id: "E", minLevel: 1, title: "Awakened", color: "#94a3b8" },
  { id: "D", minLevel: 10, title: "Hunter", color: "#4ade80" },
  { id: "C", minLevel: 20, title: "Elite Hunter", color: "#38bdf8" },
  { id: "B", minLevel: 30, title: "Raid Leader", color: "#a78bfa" },
  { id: "A", minLevel: 42, title: "Guild Master", color: "#fbbf24" },
  { id: "S", minLevel: 55, title: "Shadow Monarch", color: "#f43f5e" },
];

// XP needed to advance from `level` to `level + 1` (120, 140, 160, …).
export const xpToNext = (level) => 100 + 20 * level;

// Total XP required to reach `level` (level 1 starts at 0 XP).
export const xpAtLevel = (level) => 100 * (level - 1) + 10 * (level - 1) * level;

export function levelFromXp(xp) {
  let level = 1;
  while (xpAtLevel(level + 1) <= xp) level++;
  const into = xp - xpAtLevel(level);
  const need = xpToNext(level);
  return { level, into, need, pct: into / need };
}

export function rankForLevel(level) {
  let rank = RANKS[0];
  for (const r of RANKS) if (level >= r.minLevel) rank = r;
  return rank;
}

export function nextRank(rank) {
  const i = RANKS.findIndex((r) => r.id === rank.id);
  return RANKS[i + 1] ?? null;
}

// XP a task is worth in its current state. Dailies are worth XP_RULES.daily
// while cleared today; one-time tasks earn per checked item plus a bonus once
// fully cleared. Used both for totals and for the "+XP" shown on a click.
export function taskXp(task, state) {
  const complete = isTaskComplete(task, state);
  if (task.daily) return complete ? XP_RULES.daily : 0;
  const bonus = complete ? XP_RULES.quest : 0;
  if (task.type === "checklist" || task.type === "progress") {
    return taskUnitCount(task, state).done * XP_RULES.item + bonus;
  }
  return bonus;
}

// Completion percent with one decimal, so every single step moves it (one
// item out of 137 is 0.7%, which a whole number would hide). Floored so it
// never reads 100% before everything is done; multiplying before dividing
// avoids float slips like 29 / 100 * 100 = 28.999…
export function percent(done, total) {
  if (!total) return 0;
  if (done >= total) return 100;
  return Math.floor((done * 1000) / total) / 10;
}

// ── DATES ──
export function parseDayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDay(key, delta) {
  const date = parseDayKey(key);
  return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta));
}

// Whole days from key `a` to key `b` (b - a).
export function daysBetween(a, b) {
  return Math.round((parseDayKey(b) - parseDayKey(a)) / 86400000);
}

// Length of the run of consecutive days ending on `fromKey` where has(day).
function runBack(fromKey, has) {
  let n = 0;
  let key = fromKey;
  while (has(key)) {
    n++;
    key = shiftDay(key, -1);
  }
  return n;
}

// A streak survives until the end of today: if today isn't done yet, the
// streak is still the run that ended yesterday ("at risk" rather than lost).
function streakFrom(today, doneToday, has) {
  const past = runBack(shiftDay(today, -1), has);
  return doneToday ? past + 1 : past;
}

function hasEntries(day) {
  return !!day && Object.keys(day).length > 0;
}

// ── MAIN DERIVATION ──
// One pass over the task definitions + history that produces everything the
// UI needs: per-path progress, today's daily quest, XP/level/rank and streaks.
export function buildGame(
  { progress = {}, pinned = {}, customTasks, hiddenTasks, taskEdits, completions = {}, lastDailyReset },
  today = dayKey()
) {
  const opts = { customTasks, hiddenTasks, taskEdits };
  // Until the day's reset has run, daily progress still holds yesterday's
  // checks (already counted from the log) — treat dailies as not done yet.
  const dailyFresh = lastDailyReset == null || lastDailyReset === today;
  const xpByPath = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
  let totalXp = 0;
  let dailyClears = 0;
  let oneTimeClears = 0;

  // Daily clears are permanent XP once logged. Today's entries are skipped
  // here and counted from live progress below, so the number updates in the
  // same render as the click (the completion log is written one tick later).
  for (const [key, day] of Object.entries(completions)) {
    for (const entry of Object.values(day ?? {})) {
      if (!entry?.daily) {
        oneTimeClears++;
        continue;
      }
      dailyClears++;
      if (key === today) continue;
      totalXp += XP_RULES.daily;
      if (entry.categoryId in xpByPath) xpByPath[entry.categoryId] += XP_RULES.daily;
    }
  }

  const journey = { done: 0, total: 0 };
  const todayQuest = { done: 0, total: 0, tasks: [] };

  const paths = CATEGORIES.map((base) => {
    const category = mergeCategoryTasks(base, opts);
    const pathJourney = { done: 0, total: 0 };
    const pathDaily = { done: 0, total: 0 };
    let quests = 0;
    let cleared = 0;
    let nextUp = null;
    let pinnedNext = null;

    for (const task of category.tasks) {
      const state = task.daily && !dailyFresh ? undefined : progress[task.id];
      const complete = isTaskComplete(task, state);
      const xp = taskXp(task, state);
      totalXp += xp;
      xpByPath[base.id] += xp;

      if (task.daily) {
        pathDaily.total++;
        if (complete) pathDaily.done++;
        todayQuest.tasks.push({ task, category });
        continue;
      }

      const units = taskUnitCount(task, state);
      pathJourney.done += units.done;
      pathJourney.total += units.total;
      quests++;
      if (complete) cleared++;
      else {
        if (!nextUp) nextUp = task;
        if (!pinnedNext && pinned[task.id]) pinnedNext = task;
      }
    }

    journey.done += pathJourney.done;
    journey.total += pathJourney.total;
    todayQuest.done += pathDaily.done;
    todayQuest.total += pathDaily.total;

    return {
      id: base.id,
      category,
      accent: base.accent,
      attribute: ATTRIBUTES[base.id] ?? { short: base.name.slice(0, 3).toUpperCase(), name: base.name },
      journey: { ...pathJourney, pct: percent(pathJourney.done, pathJourney.total) },
      daily: pathDaily,
      quests,
      cleared,
      nextUp: pinnedNext ?? nextUp,
      xp: xpByPath[base.id],
    };
  });

  for (const p of paths) p.stat = Math.floor(p.xp / 10);

  // Streaks: any clear on a day keeps the activity streak alive.
  const doneToday = todayQuest.done > 0 || hasEntries(completions[today]);
  const activeDay = (key) => hasEntries(completions[key]);
  const currentStreak = streakFrom(today, doneToday, activeDay);

  let bestStreak = currentStreak;
  let run = 0;
  let prev = null;
  for (const key of Object.keys(completions).filter(activeDay).sort()) {
    run = prev && shiftDay(prev, 1) === key ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = key;
  }

  // Per-habit streaks for every daily task (today judged from live progress).
  const habitStreaks = {};
  for (const { task } of todayQuest.tasks) {
    const done = dailyFresh && isTaskComplete(task, progress[task.id]);
    habitStreaks[task.id] = streakFrom(today, done, (key) => !!completions[key]?.[task.id]);
  }

  const lvl = levelFromXp(totalXp);
  const rank = rankForLevel(lvl.level);

  return {
    today,
    paths,
    journey: { ...journey, pct: percent(journey.done, journey.total) },
    daily: { ...todayQuest, pct: percent(todayQuest.done, todayQuest.total) },
    xp: { total: totalXp, ...lvl },
    rank,
    nextRank: nextRank(rank),
    streak: { current: currentStreak, best: bestStreak, doneToday },
    habitStreaks,
    clears: { daily: dailyClears, oneTime: oneTimeClears, total: dailyClears + oneTimeClears },
  };
}

// ── HISTORY (Stats page) ──
// Day-by-day activity from the first logged day (or the journey start) to
// today, plus the summaries the Stats page shows: per-habit consistency, the
// habit rate for the last 7 finished days vs the 7 before, clears per path in
// the last 30 days and every one-time milestone.
export function buildHistory(completions, dailyTasks, today, startKey) {
  const loggedKeys = Object.keys(completions).filter((k) => hasEntries(completions[k])).sort();
  const first = loggedKeys[0] && loggedKeys[0] < startKey ? loggedKeys[0] : startKey;
  const firstKey = first > today ? today : first;
  const liveDaily = new Set(dailyTasks.map(({ task }) => task.id));

  const days = [];
  const milestones = [];
  for (let key = firstKey; key <= today; key = shiftDay(key, 1)) {
    const log = completions[key] ?? {};
    let daily = 0;
    let oneTime = 0;
    let habitHits = 0;
    for (const [id, entry] of Object.entries(log)) {
      if (entry?.daily) {
        daily++;
        if (liveDaily.has(id)) habitHits++;
      } else {
        oneTime++;
        milestones.push({ key, id, name: entry?.name ?? "Unknown quest", categoryId: entry?.categoryId });
      }
    }
    days.push({ key, daily, oneTime, total: daily + oneTime, habitHits });
  }
  milestones.reverse();

  // Consistency over the last 30 days (or fewer if the log is younger).
  const span = Math.min(30, days.length);
  const recent = days.slice(-span).map((d) => d.key);
  const habits = dailyTasks.map(({ task, category }) => {
    const hits = recent.filter((k) => completions[k]?.[task.id]).length;
    return { task, category, rate: span ? hits / span : 0, hits, span };
  });

  // Habit rate over finished days only (today is still in progress).
  const finished = days.slice(0, -1);
  const rateOf = (win) =>
    win.length && liveDaily.size
      ? win.reduce((n, d) => n + d.habitHits, 0) / (win.length * liveDaily.size)
      : null;
  const last7 = finished.slice(-7);
  const prev7 = finished.length >= 14 ? finished.slice(-14, -7) : [];

  // Clears per path over the last 30 days.
  const pathClears = {};
  for (const key of recent) {
    for (const entry of Object.values(completions[key] ?? {})) {
      const id = entry?.categoryId;
      if (id) pathClears[id] = (pathClears[id] ?? 0) + 1;
    }
  }

  return {
    days,
    firstKey,
    habits,
    milestones,
    pathClears,
    span,
    activeDays: days.filter((d) => d.total > 0).length,
    rate7: rateOf(last7),
    ratePrev7: prev7.length ? rateOf(prev7) : null,
    spark: days.slice(-14).map((d) => d.total),
  };
}

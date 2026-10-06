import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  collectDailyTaskIds,
  dayKey,
  isTaskComplete,
  mergeAllTasks,
  resetDailyProgress,
  seedDefaultItems,
} from "../data/tasks";
import { useRemoteSync } from "./useRemoteSync";

// Persist a piece of state to localStorage under `key`.
// Returns [value, setValue] just like useState.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full / unavailable — fail silently, app still works in-memory
    }
  }, [key, value]);

  return [value, setValue];
}

// Shared app state. A single Provider holds progress + pins so every consumer
// (Header, CategoryPage, Dashboard) stays in sync — without this, each hook
// call had its own isolated copy and the nav percentages only updated on a
// full page reload.
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  // progress map: { [taskId]: boolean | number }
  const [progress, setProgress] = useLocalStorage("solo-progress", {});
  // pinned map:   { [taskId]: true }  — "focus now" tasks
  const [pinned, setPinned] = useLocalStorage("solo-pinned", {});
  // user-added tasks, grouped by category id:
  //   { [categoryId]: [{ id, type, name, target? }] }
  const [customTasks, setCustomTasks] = useLocalStorage("solo-custom-tasks", {});
  // built-in tasks the user has deleted (can't be removed from the static
  // CATEGORIES array, so we hide them): { [taskId]: true }
  const [hiddenTasks, setHiddenTasks] = useLocalStorage("solo-hidden-tasks", {});
  // edits to built-in tasks (name/type/daily overrides), merged at render time:
  //   { [taskId]: { name?, type?, daily? } }
  const [taskEdits, setTaskEdits] = useLocalStorage("solo-task-edits", {});
  // the local calendar day we last reset daily tasks on (YYYY-MM-DD)
  const [lastDailyReset, setLastDailyReset] = useLocalStorage("solo-last-daily-reset", null);
  // completion history, keyed by local day → taskId → snapshot:
  //   { "YYYY-MM-DD": { [taskId]: { name, daily, categoryId } } }
  // Powers the Stats page. Recorded the moment a task becomes complete; if it's
  // un-completed on the SAME day it's removed again. Past days are immutable.
  const [completions, setCompletions] = useLocalStorage("solo-completions", {});
  // which checklist tasks have had their default items seeded (one-shot):
  //   { [taskId]: true }
  const [seeded, setSeeded] = useLocalStorage("solo-seeded", {});
  // free-text notes on quests and checklist items, keyed like pins:
  //   { [taskId | "taskId::itemId"]: string }  ("" = cleared)
  const [notes, setNotes] = useLocalStorage("solo-notes", {});
  // cross-device sync code (null = sync off). The code is the secret that
  // identifies this user's document on the server.
  const [syncKey, setSyncKey] = useLocalStorage("solo-sync-key", null);

  // Keep the latest task-definition state in a ref so the long-lived effects
  // below (which we don't want to re-subscribe on every keystroke) can read
  // current values without listing them as dependencies. Updated in an effect,
  // never during render.
  const taskDefsRef = useRef({ customTasks, hiddenTasks, taskEdits });
  const progressRef = useRef(progress);
  const seededRef = useRef(seeded);
  useEffect(() => {
    taskDefsRef.current = { customTasks, hiddenTasks, taskEdits };
    progressRef.current = progress;
    seededRef.current = seeded;
  });

  // Seed checklist tasks that ship with `defaultItems` (e.g. the daily hunt
  // sources) the first time we see them — one-shot, tracked by the `seeded`
  // marker so we NEVER overwrite the user's later edits/deletions on reload.
  // Existing users whose items predate the marker are simply adopted (marked
  // seeded without touching their items). Mount-only; the setters are stable.
  useEffect(() => {
    const result = seedDefaultItems(
      progressRef.current,
      seededRef.current,
      taskDefsRef.current
    );
    if (result.progress !== progressRef.current) setProgress(result.progress);
    if (result.seeded !== seededRef.current) setSeeded(result.seeded);
  }, [setProgress, setSeeded]);

  // Clear daily tasks' progress whenever the local day rolls over. Runs on
  // mount and again at the next midnight (and on tab focus, in case the device
  // slept past midnight). Uses the live customTasks/taskEdits so custom and
  // edited daily tasks are included.
  useEffect(() => {
    const runReset = () => {
      const today = dayKey();
      if (lastDailyReset === today) return;
      const dailyIds = collectDailyTaskIds(taskDefsRef.current);
      setProgress((prev) => resetDailyProgress(prev, dailyIds));
      setLastDailyReset(today);
    };

    runReset();

    // Schedule a reset just after the next local midnight.
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      5 // 5s past midnight to avoid edge timing
    );
    const timer = setTimeout(runReset, nextMidnight.getTime() - now.getTime());

    const onFocus = () => runReset();
    window.addEventListener("focus", onFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [lastDailyReset, setProgress, setLastDailyReset]);

  // ── COMPLETION LOGGER ──
  // Watch `progress` and, whenever a task's completion state flips, record it
  // into today's completion log (or un-record it if it flips back off the same
  // day). We diff against the previous progress snapshot so any code path that
  // changes progress — checkbox, checklist, focused view — is captured.
  const prevProgressRef = useRef(progress);

  useEffect(() => {
    const prev = prevProgressRef.current;
    prevProgressRef.current = progress;
    if (prev === progress) return;

    const tasks = mergeAllTasks(taskDefsRef.current);
    const today = dayKey();
    const turnedOn = [];
    const turnedOff = [];

    for (const task of tasks) {
      const wasDone = isTaskComplete(task, prev[task.id]);
      const nowDone = isTaskComplete(task, progress[task.id]);
      if (wasDone === nowDone) continue;
      if (nowDone) turnedOn.push(task);
      else turnedOff.push(task);
    }

    if (turnedOn.length === 0 && turnedOff.length === 0) return;

    setCompletions((log) => {
      const day = { ...(log[today] ?? {}) };
      let changed = false;
      for (const t of turnedOn) {
        day[t.id] = { name: t.name, daily: !!t.daily, categoryId: t.categoryId };
        changed = true;
      }
      for (const t of turnedOff) {
        // Only un-record if it was completed today; never touch past days.
        if (t.id in day) {
          delete day[t.id];
          changed = true;
        }
      }
      if (!changed) return log;
      const next = { ...log };
      if (Object.keys(day).length === 0) delete next[today];
      else next[today] = day;
      return next;
    });
  }, [progress, setCompletions]);

  const setTask = useCallback(
    (taskId, next) => {
      setProgress((prev) => ({ ...prev, [taskId]: next }));
    },
    [setProgress]
  );

  const addCustomTask = useCallback(
    (categoryId, task) => {
      setCustomTasks((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] ?? []), task],
      }));
    },
    [setCustomTasks]
  );

  // Delete any task. Custom tasks are removed outright; built-in tasks are
  // hidden (the static list can't be mutated). Either way we clean up the
  // task's stored progress and any pins (whole-task or per-item).
  const deleteTask = useCallback(
    (categoryId, taskId, isCustom) => {
      if (isCustom) {
        setCustomTasks((prev) => ({
          ...prev,
          [categoryId]: (prev[categoryId] ?? []).filter((t) => t.id !== taskId),
        }));
      } else {
        setHiddenTasks((prev) => ({ ...prev, [taskId]: true }));
      }
      setProgress((prev) => {
        if (!(taskId in prev)) return prev;
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setPinned((prev) => {
        // drop the whole-task pin and any "taskId::itemId" item pins
        const next = {};
        let changed = false;
        for (const key of Object.keys(prev)) {
          if (key === taskId || key.startsWith(`${taskId}::`)) {
            changed = true;
            continue;
          }
          next[key] = prev[key];
        }
        return changed ? next : prev;
      });
      setNotes((prev) => {
        // same keys as pins: the task's own note and its items' notes
        const next = {};
        let changed = false;
        for (const key of Object.keys(prev)) {
          if (key === taskId || key.startsWith(`${taskId}::`)) {
            changed = true;
            continue;
          }
          next[key] = prev[key];
        }
        return changed ? next : prev;
      });
    },
    [setCustomTasks, setHiddenTasks, setProgress, setPinned, setNotes]
  );

  // Edit a task's name and/or type. `changes` = { name?, type? }.
  // Custom tasks are updated in place; built-in tasks get an override.
  // When the type changes we clear stored progress (the value shape differs
  // between a check boolean and a checklist object).
  const editTask = useCallback(
    (categoryId, taskId, isCustom, changes, typeChanged) => {
      if (isCustom) {
        setCustomTasks((prev) => ({
          ...prev,
          [categoryId]: (prev[categoryId] ?? []).map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  ...changes,
                  // a checklist needs a target; keep existing or default to 1
                  ...(changes.type === "checklist" && t.type !== "checklist"
                    ? { target: t.target ?? 1 }
                    : {}),
                }
              : t
          ),
        }));
      } else {
        setTaskEdits((prev) => ({
          ...prev,
          [taskId]: { ...prev[taskId], ...changes },
        }));
      }
      if (typeChanged) {
        setProgress((prev) => {
          if (!(taskId in prev)) return prev;
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    },
    [setCustomTasks, setTaskEdits, setProgress]
  );

  // CROSS-DEVICE SYNC
  // The full serializable app state, as one document. Field order matters:
  // useRemoteSync compares JSON strings to detect changes, and mergeDocs in
  // useRemoteSync.js builds documents with this same key order.
  const doc = useMemo(
    () => ({
      progress,
      pinned,
      customTasks,
      hiddenTasks,
      taskEdits,
      seeded,
      completions,
      lastDailyReset,
      notes,
    }),
    [progress, pinned, customTasks, hiddenTasks, taskEdits, seeded, completions, lastDailyReset, notes]
  );

  const normalizeSyncedDoc = useCallback((data = {}) => {
    const next = {
      progress: data.progress ?? {},
      pinned: data.pinned ?? {},
      customTasks: data.customTasks ?? {},
      hiddenTasks: data.hiddenTasks ?? {},
      taskEdits: data.taskEdits ?? {},
      seeded: data.seeded ?? {},
      completions: data.completions ?? {},
      lastDailyReset: data.lastDailyReset ?? null,
      notes: data.notes ?? {},
    };

    const today = dayKey();
    if (next.lastDailyReset !== today) {
      const dailyIds = collectDailyTaskIds({
        customTasks: next.customTasks,
        taskEdits: next.taskEdits,
      });
      next.progress = resetDailyProgress(next.progress, dailyIds);
      next.lastDailyReset = today;
    }

    return next;
  }, []);

  // Write a server document back into local state (all setters batch into one
  // render). Missing fields fall back to empty so an older document shape
  // can't wipe state with `undefined`.
  const applyRemote = useCallback(
    (data) => {
      const next = normalizeSyncedDoc(data);

      // Remote progress is history arriving from another device, not a fresh
      // local completion event. Keep the completion logger from re-recording it
      // as completed today.
      prevProgressRef.current = next.progress;
      progressRef.current = next.progress;
      taskDefsRef.current = {
        customTasks: next.customTasks,
        hiddenTasks: next.hiddenTasks,
        taskEdits: next.taskEdits,
      };
      seededRef.current = next.seeded;

      setProgress(next.progress);
      setPinned(next.pinned);
      setCustomTasks(next.customTasks);
      setHiddenTasks(next.hiddenTasks);
      setTaskEdits(next.taskEdits);
      setSeeded(next.seeded);
      setCompletions(next.completions);
      setLastDailyReset(next.lastDailyReset);
      setNotes(next.notes);
    },
    [normalizeSyncedDoc, setProgress, setPinned, setCustomTasks, setHiddenTasks, setTaskEdits, setSeeded, setCompletions, setLastDailyReset, setNotes]
  );

  const { status: syncStatus, lastSyncedAt, syncNow } = useRemoteSync({
    syncKey,
    doc,
    applyRemote,
    normalizeDoc: normalizeSyncedDoc,
  });

  const togglePin = useCallback(
    (taskId) => {
      setPinned((prev) => {
        const next = { ...prev };
        if (next[taskId]) delete next[taskId];
        else next[taskId] = true;
        return next;
      });
    },
    [setPinned]
  );

  // Clearing stores "" rather than deleting the key, so a sync merge (local
  // wins per key) can't bring an older copy of the note back.
  const setNote = useCallback(
    (key, text) => {
      setNotes((prev) => ({ ...prev, [key]: text }));
    },
    [setNotes]
  );

  return createElement(
    ProgressContext.Provider,
    {
      value: {
        progress,
        setTask,
        setProgress,
        pinned,
        togglePin,
        customTasks,
        hiddenTasks,
        taskEdits,
        addCustomTask,
        deleteTask,
        editTask,
        completions,
        lastDailyReset,
        notes,
        setNote,
        sync: { key: syncKey, setKey: setSyncKey, status: syncStatus, lastSyncedAt, syncNow },
      },
    },
    children
  );
}

function useAppState() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("hook must be used within a ProgressProvider");
  return ctx;
}

// Backwards-compatible tuple API: [progress, setTask, setProgress]
export function useProgress() {
  const { progress, setTask, setProgress } = useAppState();
  return [progress, setTask, setProgress];
}

// Pins API: [pinned, togglePin]
export function usePinned() {
  const { pinned, togglePin } = useAppState();
  return [pinned, togglePin];
}

// Completion history: { "YYYY-MM-DD": { [taskId]: { name, daily, categoryId } } }
export function useCompletions() {
  return useAppState().completions;
}

// The local day (YYYY-MM-DD) daily tasks were last reset on. Until it equals
// today, daily progress still belongs to a previous day.
export function useLastDailyReset() {
  return useAppState().lastDailyReset;
}

// Notes API: [notes, setNote]. Keys are a task id or "taskId::itemId".
export function useNotes() {
  const { notes, setNote } = useAppState();
  return [notes, setNote];
}

// Cross-device sync: { key, setKey, status, lastSyncedAt, syncNow }.
// status: "off" | "syncing" | "synced" | "error".
export function useSync() {
  return useAppState().sync;
}

// Tasks the user has customized: added (customTasks), deleted/hidden
// (hiddenTasks), edited (taskEdits), plus the actions to add/delete/edit.
export function useCustomTasks() {
  const { customTasks, hiddenTasks, taskEdits, addCustomTask, deleteTask, editTask } =
    useAppState();
  return { customTasks, hiddenTasks, taskEdits, addCustomTask, deleteTask, editTask };
}

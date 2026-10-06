import { isTaskComplete } from "../../data/tasks";

// Pinned quest ids / item keys that are already done — pinned work that was
// finished before this view opened doesn't belong in Focus.
export function doneKeys(pinned, progress, paths) {
  const keys = new Set();
  for (const p of paths) {
    for (const t of p.category.tasks) {
      if (pinned[t.id] && isTaskComplete(t, progress[t.id])) keys.add(t.id);
    }
  }
  for (const key of Object.keys(pinned)) {
    const [taskId, itemId] = key.split("::");
    if (itemId && progress[taskId]?.checked?.[itemId]) keys.add(key);
  }
  return keys;
}

// Collect pinned quests and checklist items for the given paths. Ones finished
// during this visit (not in `finished`) stay listed — checked, one tap from
// undo — instead of vanishing mid-interaction; they drop out next visit.
export function collectFocus(paths, pinned, progress, finished) {
  const quests = [];
  const items = [];
  for (const p of paths) {
    for (const t of p.category.tasks) {
      if (pinned[t.id] && !finished.has(t.id)) quests.push({ task: t, path: p });
    }
  }
  for (const key of Object.keys(pinned)) {
    if (!pinned[key] || !key.includes("::") || finished.has(key)) continue;
    const [taskId, itemId] = key.split("::");
    for (const p of paths) {
      const parent = p.category.tasks.find((t) => t.id === taskId);
      if (!parent) continue;
      const value = progress[taskId];
      const item = value?.items?.find((i) => i.id === itemId);
      if (item) items.push({ key, parent, item, value, path: p });
      break;
    }
  }
  return { quests, items, count: quests.length + items.length };
}

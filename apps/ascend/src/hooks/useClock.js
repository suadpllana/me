import { useSyncExternalStore } from "react";
import { dayKey } from "../data/tasks";

// A tiny external store that re-reads a time-derived value on an interval (and
// when the tab regains focus, in case the device slept). Components re-render
// only when the derived value actually changes.
function createClock(intervalMs, read) {
  let value = read();
  const listeners = new Set();
  let timer = null;

  const tick = () => {
    const next = read();
    if (next === value) return;
    value = next;
    listeners.forEach((l) => l());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!timer) {
        timer = setInterval(tick, intervalMs);
        window.addEventListener("focus", tick);
        document.addEventListener("visibilitychange", tick);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          clearInterval(timer);
          timer = null;
          window.removeEventListener("focus", tick);
          document.removeEventListener("visibilitychange", tick);
        }
      };
    },
    get() {
      if (listeners.size === 0) value = read();
      return value;
    },
  };
}

const secondClock = createClock(1000, () => Math.floor(Date.now() / 1000));
const minuteClock = createClock(15000, () => Math.floor(Date.now() / 60000));
const dayClock = createClock(15000, () => dayKey());

// Current time in ms, ticking once per second. Keep to small leaf components.
export function useNowSecond() {
  return useSyncExternalStore(secondClock.subscribe, secondClock.get) * 1000;
}

// Current time in ms, ticking once per minute.
export function useNowMinute() {
  return useSyncExternalStore(minuteClock.subscribe, minuteClock.get) * 60000;
}

// Today's local day key (YYYY-MM-DD); rolls over at midnight.
export function useToday() {
  return useSyncExternalStore(dayClock.subscribe, dayClock.get);
}

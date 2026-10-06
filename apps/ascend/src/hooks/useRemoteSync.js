import { useCallback, useEffect, useRef, useState } from "react";

// Client half of the cross-device sync. The server (netlify/functions/sync.mjs)
// stores one JSON document per sync code with a monotonically increasing `rev`.
// localStorage stays the source of truth for instant/offline use; this engine
// reconciles it with the server:
//
//   pull  - on mount, tab focus, coming back online, and every POLL_MS
//   push  - debounced after any local change
//
// Conflict rules:
//   - first sync under a code (nothing synced yet on this device): the server
//     document wins wholesale - that's the point of entering a code from
//     another device. Completion history is unioned so no days are lost.
//   - after that: if both sides changed, maps are merged with the LOCAL value
//     winning per key (the local change is the user's most recent action),
//     completions are unioned per day.
// Proxied (see root netlify.toml) to the original Ascend site so the same sync
// code shares one document between ascendpath.netlify.app and this app.
const ENDPOINT = "/api/ascend-sync";
const PUSH_DEBOUNCE_MS = 1500;
const POLL_MS = 60_000;

// Unambiguous alphabet (no 0/o, 1/l/i) - 12 chars is about 58 bits of entropy.
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const SYNC_CODE_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;

export function generateSyncCode() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}`;
}

export function normalizeSyncCode(input) {
  const code = String(input ?? "").trim().toLowerCase();
  return SYNC_CODE_RE.test(code) ? code : null;
}

const mergeMap = (remote = {}, local = {}) => ({ ...remote, ...local });

function mergeCompletions(remote = {}, local = {}) {
  const merged = { ...remote };
  for (const [day, tasks] of Object.entries(local)) {
    merged[day] = { ...merged[day], ...tasks };
  }
  return merged;
}

// Merge two sync documents. `preferRemote` flips the per-key winner and is
// used for the very first pull under a code (server wins).
function mergeDocs(remote, local, { preferRemote = false } = {}) {
  const [lo, hi] = preferRemote ? [local, remote] : [remote, local];
  const laterDay = (a, b) => ((String(a ?? "") > String(b ?? "") ? a : b) ?? null);
  return {
    progress: mergeMap(lo.progress, hi.progress),
    pinned: mergeMap(lo.pinned, hi.pinned),
    customTasks: mergeMap(lo.customTasks, hi.customTasks),
    hiddenTasks: mergeMap(lo.hiddenTasks, hi.hiddenTasks),
    taskEdits: mergeMap(lo.taskEdits, hi.taskEdits),
    seeded: mergeMap(lo.seeded, hi.seeded),
    completions: mergeCompletions(lo.completions, hi.completions),
    // YYYY-MM-DD strings compare correctly; take the most recent reset so the
    // pulling device doesn't re-reset a day the other device already handled.
    lastDailyReset: laterDay(remote.lastDailyReset, local.lastDailyReset),
    notes: mergeMap(lo.notes, hi.notes),
  };
}

// `doc` is the full serializable app state; `applyRemote(doc)` writes a doc
// back into React state. `syncKey` is null when sync is off.
export function useRemoteSync({ syncKey, doc, applyRemote, normalizeDoc = (value) => value }) {
  // network status of the engine; "off" is derived from syncKey on return
  const [status, setStatus] = useState("syncing");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const docRef = useRef(doc);
  const applyRef = useRef(applyRemote);
  const normalizeRef = useRef(normalizeDoc);
  useEffect(() => {
    docRef.current = doc;
    applyRef.current = applyRemote;
    normalizeRef.current = normalizeDoc;
  });

  const keyRef = useRef(syncKey);
  const revRef = useRef(0); // server rev this device last saw
  const lastSyncedJsonRef = useRef(null); // doc JSON at last successful sync (null = never)
  const inflightRef = useRef(false);
  const queuedRef = useRef(false);

  const sync = useCallback(async () => {
    if (!keyRef.current) return;
    if (inflightRef.current) {
      // A sync is already running; run one more pass when it finishes.
      queuedRef.current = true;
      return;
    }
    inflightRef.current = true;
    setStatus("syncing");

    do {
      queuedRef.current = false;
      const key = keyRef.current;
      if (!key) break;
      try {
        const normalize = normalizeRef.current;
        const localDoc = normalize(docRef.current);
        const localJson = JSON.stringify(localDoc);
        const dirty = localJson !== lastSyncedJsonRef.current;
        const firstSync = lastSyncedJsonRef.current === null;

        const getRes = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`);
        if (!getRes.ok) throw new Error(`GET ${getRes.status}`);
        const remote = await getRes.json(); // { rev, data }
        const remoteData = remote.data == null ? null : normalize(remote.data);
        const remoteJson = remoteData == null ? null : JSON.stringify(remoteData);
        const rawRemoteJson = remote.data == null ? null : JSON.stringify(remote.data);
        const remoteNeedsWrite = remoteData != null && remoteJson !== rawRemoteJson;

        let toPush = null;

        if (remoteData != null && (remote.rev !== revRef.current || remoteNeedsWrite)) {
          // Server has something newer, or it needs normalized data written back.
          revRef.current = remote.rev;
          if (firstSync) {
            // Joining an existing code: server wins, keep local history days.
            const merged = normalize(mergeDocs(remoteData, localDoc, { preferRemote: true }));
            applyRef.current(merged);
            docRef.current = merged;
            // Push only if the union actually added anything beyond the server copy.
            const mergedJson = JSON.stringify(merged);
            if (mergedJson !== rawRemoteJson) toPush = merged;
            else lastSyncedJsonRef.current = mergedJson;
          } else if (dirty) {
            // Both sides changed since last sync: merge, local edits win.
            const merged = normalize(mergeDocs(remoteData, localDoc));
            applyRef.current(merged);
            docRef.current = merged;
            toPush = merged;
          } else {
            // Clean local: just take the server copy.
            applyRef.current(remoteData);
            docRef.current = remoteData;
            if (remoteNeedsWrite) toPush = remoteData;
            else lastSyncedJsonRef.current = remoteJson;
          }
        } else if (dirty || remote.data == null) {
          // Server is empty or unchanged and we have local changes: upload.
          toPush = localDoc;
        }

        if (toPush) {
          // One retry on rev conflict (another device wrote between GET and PUT).
          let pushed = false;
          for (let attempt = 0; attempt < 2; attempt++) {
            const putRes = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ rev: revRef.current, data: toPush }),
            });
            if (putRes.status === 409) {
              const current = await putRes.json();
              revRef.current = current.rev;
              const currentData = current.data == null ? {} : normalize(current.data);
              toPush = normalize(mergeDocs(currentData, docRef.current));
              applyRef.current(toPush);
              docRef.current = toPush;
              continue;
            }
            if (!putRes.ok) throw new Error(`PUT ${putRes.status}`);
            const { rev } = await putRes.json();
            revRef.current = rev;
            lastSyncedJsonRef.current = JSON.stringify(toPush);
            pushed = true;
            break;
          }
          if (!pushed) throw new Error("PUT conflict");
        }

        setStatus("synced");
        setLastSyncedAt(Date.now());
      } catch {
        // Network down / not running under Netlify - stay offline, retry later.
        setStatus("error");
      }
    } while (queuedRef.current);

    inflightRef.current = false;
  }, []);

  // Key changes (connect / disconnect / switch code): reset sync bookkeeping.
  // The first sync is deferred a tick so the effect body itself doesn't set
  // state (and StrictMode's double mount collapses into one run).
  useEffect(() => {
    keyRef.current = syncKey;
    revRef.current = 0;
    lastSyncedJsonRef.current = null;
    if (!syncKey) return;
    const timer = setTimeout(sync, 0);
    return () => clearTimeout(timer);
  }, [syncKey, sync]);

  // Debounced push whenever local state changes.
  useEffect(() => {
    if (!syncKey) return;
    if (JSON.stringify(doc) === lastSyncedJsonRef.current) return;
    const timer = setTimeout(sync, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [doc, syncKey, sync]);

  // Pull when the tab regains focus / connectivity, and on a slow poll so a
  // device left open picks up the other device's changes.
  useEffect(() => {
    if (!syncKey) return;
    const onWake = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    document.addEventListener("visibilitychange", onWake);
    const interval = setInterval(onWake, POLL_MS);
    return () => {
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
      document.removeEventListener("visibilitychange", onWake);
      clearInterval(interval);
    };
  }, [syncKey, sync]);

  return {
    status: syncKey ? status : "off",
    lastSyncedAt: syncKey ? lastSyncedAt : null,
    syncNow: sync,
  };
}

import { useState } from "react";
import { Cloud, Copy, RefreshCw } from "lucide-react";
import Modal from "./ui/Modal";
import { useSync } from "../hooks/useLocalStorage";
import { generateSyncCode, normalizeSyncCode } from "../hooks/useRemoteSync";
import { useToast } from "./feedback/toast-context";
import { SYNC_STATUS } from "./layout/sync-status";

// Settings dialog for cross-device sync. One device creates a sync code, the
// other enters it; from then on both read/write the same server document.
// Mounted only while open, so input state starts fresh each time.
export default function SyncModal({ onClose }) {
  const { key, setKey, status, lastSyncedAt, syncNow } = useSync();
  const toast = useToast();
  const [codeInput, setCodeInput] = useState("");
  const [inputError, setInputError] = useState(null);
  const s = SYNC_STATUS[status] ?? SYNC_STATUS.off;

  const createCode = () => {
    setKey(generateSyncCode());
    toast("Sync enabled — enter this code on your other device");
  };

  const connect = () => {
    const code = normalizeSyncCode(codeInput);
    if (!code) {
      setInputError("That doesn't look like a sync code (e.g. abcd-efgh-jkmn).");
      return;
    }
    setKey(code);
    toast("Connected — pulling progress…");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(key);
      toast("Sync code copied");
    } catch {
      toast("Couldn't copy — select the code manually", "error");
    }
  };

  const disconnect = () => {
    setKey(null);
    toast("Sync turned off — data stays on this device");
  };

  return (
    <Modal
      open
      onClose={onClose}
      icon={Cloud}
      accent="#4da3ff"
      title="Cross-device sync"
      description={
        key
          ? "Progress on this device syncs with every device using this code."
          : "Keep your phone and PC on the same progress."
      }
    >
      {key ? (
        <div className="space-y-4">
          <div>
            <p className="sys-title text-[11px] mb-2">Your sync code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate rounded-xl border border-edge bg-void/70 px-3.5 h-12 flex items-center font-mono text-base text-system-hi tracking-wider select-all">
                {key}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 inline-flex items-center gap-2 h-12 px-4 rounded-xl border border-edge-hi/70 text-sm font-semibold text-ink hover:bg-white/[0.06] transition-colors"
              >
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-abyss/60 px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-sm text-ink-2 min-w-0">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${status === "syncing" ? "animate-pulse" : ""}`}
                style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }}
              />
              <span className="truncate">
                {s.label}
                {status === "synced" && lastSyncedAt && (
                  <span className="text-ink-3">
                    {" · "}
                    {new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </span>
            </span>
            <button
              type="button"
              onClick={syncNow}
              className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg font-display text-xs font-bold uppercase tracking-wider text-system hover:bg-system/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === "syncing" ? "animate-spin" : ""}`} aria-hidden="true" />
              Sync now
            </button>
          </div>

          <p className="text-xs text-ink-3 leading-relaxed">
            On your other device, open this dialog and enter the code above. Keep it private —
            anyone with the code can see and change your progress.
          </p>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={disconnect}
              className="h-10 px-3 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
            >
              Turn off sync
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl font-display text-sm font-bold tracking-wide bg-system text-void hover:brightness-110 transition"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={createCode}
            className="w-full h-12 rounded-xl font-display text-[15px] font-bold tracking-wide bg-system text-void shadow-[0_0_24px_rgba(77,163,255,0.35)] hover:brightness-110 transition"
          >
            Create a new sync code
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-edge" />
            <span className="sys-title text-[11px] text-ink-3">or</span>
            <span className="flex-1 h-px bg-edge" />
          </div>

          <div>
            <label htmlFor="sync-code" className="sys-title text-[11px] block mb-2">
              Enter a code from another device
            </label>
            <div className="flex items-center gap-2">
              <input
                id="sync-code"
                data-autofocus
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setInputError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && connect()}
                placeholder="abcd-efgh-jkmn"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={!!inputError}
                className="flex-1 min-w-0 h-12 rounded-xl border border-edge bg-void/70 px-3.5 font-mono text-sm text-ink placeholder:text-ink-3/70 focus:outline-none focus:border-system/60 transition-colors"
              />
              <button
                type="button"
                onClick={connect}
                disabled={!codeInput.trim()}
                className="shrink-0 h-12 px-4 rounded-xl font-display text-sm font-bold text-system border border-system/40 hover:bg-system/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Connect
              </button>
            </div>
            {inputError && <p className="mt-2 text-xs text-red-300">{inputError}</p>}
            <p className="mt-2 text-xs text-ink-3 leading-relaxed">
              Connecting pulls the progress stored under that code onto this device.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

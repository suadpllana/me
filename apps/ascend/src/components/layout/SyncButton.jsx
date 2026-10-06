import { useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { useSync } from "../../hooks/useLocalStorage";
import SyncModal from "../SyncModal";
import { SYNC_STATUS } from "./sync-status";

// Opens the sync dialog. `variant="row"` (sidebar) also shows the status text;
// the default icon button shows it as a colored dot.
export default function SyncButton({ variant = "icon" }) {
  const { status, lastSyncedAt } = useSync();
  const [open, setOpen] = useState(false);
  const s = SYNC_STATUS[status] ?? SYNC_STATUS.off;
  const Icon = status === "off" ? CloudOff : Cloud;

  return (
    <>
      {variant === "row" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 h-11 px-3 rounded-xl text-left text-sm text-ink-2 hover:text-ink hover:bg-white/[0.05] transition-colors"
        >
          <span className="relative">
            <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
            {status !== "off" && (
              <span
                className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${status === "syncing" ? "animate-pulse" : ""}`}
                style={{ background: s.color }}
              />
            )}
          </span>
          <span className="flex-1 truncate">
            {s.label}
            {status === "synced" && lastSyncedAt && (
              <span className="text-ink-3">
                {" · "}
                {new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </span>
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Sync settings (${s.label})`}
          title={s.label}
          onClick={() => setOpen(true)}
          className="relative grid place-items-center w-10 h-10 rounded-xl border border-edge bg-abyss/60 text-ink-2 hover:text-ink hover:bg-white/[0.05] transition-colors"
        >
          <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
          {status !== "off" && (
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-void ${status === "syncing" ? "animate-pulse" : ""}`}
              style={{ background: s.color }}
            />
          )}
        </button>
      )}
      {open && <SyncModal onClose={() => setOpen(false)} />}
    </>
  );
}

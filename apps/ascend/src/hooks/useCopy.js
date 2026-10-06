import { useCallback } from "react";
import { Copy } from "lucide-react";
import { useToast } from "../components/feedback/toast-context";

// Copy text to the clipboard and confirm with a toast. Falls back to a hidden
// textarea + execCommand where the async Clipboard API is missing (older
// browsers, non-secure origins).
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall through to the legacy path
    }
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  el.remove();
  if (!ok) throw new Error("copy failed");
}

export function useCopy() {
  const toast = useToast();
  return useCallback(
    async (text, label = "Copied") => {
      try {
        await writeClipboard(text);
        toast({ title: label, message: text, icon: Copy });
      } catch {
        toast("Couldn't copy — select the text manually", "error");
      }
    },
    [toast]
  );
}

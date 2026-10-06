import { useEffect } from "react";

// Sets the browser tab title for the current page ("Mind · Ascend!").
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Ascend!` : "Ascend!";
  }, [title]);
}

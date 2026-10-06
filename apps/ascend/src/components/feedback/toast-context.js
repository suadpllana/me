import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

// Fire a toast from anywhere:
//   const toast = useToast();
//   toast("Saved");                         // success
//   toast("Couldn't copy", "error");        // error
//   toast({ title, message, tone, icon, accent, xp, action: { label, onClick } });
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

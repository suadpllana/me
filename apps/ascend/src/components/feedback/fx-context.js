import { createContext, useContext } from "react";

// Visual effects: burst(anchorElement, { color, text, big }) plays a particle
// burst + floating label (e.g. "+50 XP") centered on the element.
export const FxContext = createContext(null);

export function useFx() {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error("useFx must be used within an FxProvider");
  return ctx;
}

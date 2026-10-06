import { createContext, useContext } from "react";

// Derived game state (see buildGame in data/game.js), computed once by
// <GameProvider> and shared by every view.
export const GameContext = createContext(null);

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used within a GameProvider");
  return game;
}

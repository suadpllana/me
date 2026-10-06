import { useMemo } from "react";
import { buildGame } from "../data/game";
import { GameContext } from "../hooks/game-context";
import {
  useCompletions,
  useCustomTasks,
  useLastDailyReset,
  usePinned,
  useProgress,
} from "../hooks/useLocalStorage";
import { useToday } from "../hooks/useClock";

// Computes the derived game state (paths, XP, level, streaks…) once per state
// change and shares it, so every view shows identical numbers.
export default function GameProvider({ children }) {
  const [progress] = useProgress();
  const [pinned] = usePinned();
  const { customTasks, hiddenTasks, taskEdits } = useCustomTasks();
  const completions = useCompletions();
  const lastDailyReset = useLastDailyReset();
  const today = useToday();

  const game = useMemo(
    () =>
      buildGame(
        { progress, pinned, customTasks, hiddenTasks, taskEdits, completions, lastDailyReset },
        today
      ),
    [progress, pinned, customTasks, hiddenTasks, taskEdits, completions, lastDailyReset, today]
  );

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

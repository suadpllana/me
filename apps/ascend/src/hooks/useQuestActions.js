import { useCallback } from "react";
import { Ban, Trophy } from "lucide-react";
import { isTaskComplete } from "../data/tasks";
import { taskXp } from "../data/game";
import { useProgress } from "./useLocalStorage";
import { useFx } from "../components/feedback/fx-context";
import { useToast } from "../components/feedback/toast-context";

// Every change to a task's progress from the UI goes through update(), which
// saves it and plays the matching feedback at the element that was clicked:
//   • a particle burst + "+XP" float when XP is gained (a quieter "−XP" when lost)
//   • a "Quest cleared" toast with Undo when a one-time quest is completed
//   • a light haptic tick on phones that support it
// Level-ups and the Daily Quest banner are detected globally by <FxProvider>.
export function useQuestActions() {
  const [progress, setTask] = useProgress();
  const { burst } = useFx();
  const toast = useToast();

  const update = useCallback(
    (task, next, { anchor, accent = "#4da3ff" } = {}) => {
      const prev = progress[task.id];
      setTask(task.id, next);

      const delta = taskXp(task, next) - taskXp(task, prev);
      if (anchor && delta > 0) burst(anchor, { color: accent, text: `+${delta} XP` });
      else if (anchor && delta < 0) burst(anchor, { color: "#7584a8", text: `−${-delta} XP` });
      if (delta > 0) navigator.vibrate?.(12);

      const undo = { label: "Undo", onClick: () => setTask(task.id, prev) };
      const wasDone = isTaskComplete(task, prev);
      const nowDone = isTaskComplete(task, next);
      if (!task.daily && nowDone && !wasDone) {
        toast({ title: "Quest cleared", message: task.name, icon: Trophy, accent, xp: delta, action: undo });
      } else if (next === "no-profit") {
        toast({
          title: "Marked no profit",
          message: `${task.name} stays cleared, earned nothing`,
          icon: Ban,
          accent: "#94a3b8",
          action: undo,
        });
      }
    },
    [progress, setTask, burst, toast]
  );

  return { update };
}

import { useState } from "react";
import { Crosshair, Pin } from "lucide-react";
import { useGame } from "../../hooks/game-context";
import { useCustomTasks, usePinned, useProgress } from "../../hooks/useLocalStorage";
import { useToast } from "../feedback/toast-context";
import Panel, { PanelTitle } from "../ui/Panel";
import TaskItem, { FocusedItem } from "../tasks/TaskItem";
import { collectFocus, doneKeys } from "./focus";

// "Focus" — pinned quests and checklist items. On home it mixes every path
// (rows get a path chip); on a path page pass `pathIds` to scope it,
// `manage` to allow editing / deleting from here, and the page's own
// `finished` snapshot so both agree on what's listed.
export default function FocusList({ pathIds, variant = "panel", manage = false, finished: finishedProp }) {
  const { paths, habitStreaks } = useGame();
  const [progress] = useProgress();
  const [pinned, togglePin] = usePinned();
  const { customTasks, editTask, deleteTask } = useCustomTasks();
  const toast = useToast();
  const scoped = pathIds ? paths.filter((p) => pathIds.includes(p.id)) : paths;
  const mixed = !pathIds;
  const [ownFinished] = useState(() => doneKeys(pinned, progress, scoped));
  const finished = finishedProp ?? ownFinished;
  const { quests, items, count } = collectFocus(scoped, pinned, progress, finished);

  if (count === 0) {
    if (variant !== "panel") return null;
    return (
      <Panel flat className="p-4 sm:p-5" aria-labelledby="focus-title">
        <PanelTitle id="focus-title" icon={Crosshair}>
          Focus
        </PanelTitle>
        <div className="mt-4 rounded-xl border border-dashed border-edge p-4 text-sm text-ink-3 leading-relaxed">
          Nothing pinned yet. Open the <span className="text-ink-2">⋯</span> menu on any quest or checklist item
          and choose <span className="text-ink-2 inline-flex items-center gap-1"><Pin className="w-3 h-3 rotate-45" aria-hidden="true" />Pin to focus</span>{" "}
          to keep your priorities here.
        </div>
      </Panel>
    );
  }

  const list = (
    <ul className="flex flex-col gap-2">
      {items.map(({ key, parent, item, value, path }) => (
        <li key={key} id={`task-${key}`}>
          <FocusedItem
            parentTask={parent}
            item={item}
            value={value}
            accent={path.accent}
            categoryId={path.id}
            path={mixed ? { id: path.id, name: path.category.name } : undefined}
            openable={mixed}
            onUnpin={() => togglePin(key)}
          />
        </li>
      ))}
      {quests.map(({ task, path }) => {
        const isCustom = (customTasks[path.id] ?? []).some((t) => t.id === task.id);
        return (
          <li key={task.id} id={`task-${task.id}`}>
            <TaskItem
              task={task}
              value={progress[task.id]}
              accent={path.accent}
              categoryId={path.id}
              pinned
              onTogglePin={() => togglePin(task.id)}
              streak={habitStreaks[task.id] ?? 0}
              path={mixed ? { id: path.id, name: path.category.name } : undefined}
              openable={mixed}
              showDaily
              onEdit={
                manage
                  ? (changes) => {
                      editTask(path.id, task.id, isCustom, changes, changes.type !== task.type);
                      toast("Quest updated");
                    }
                  : undefined
              }
              onDelete={
                manage
                  ? () => {
                      deleteTask(path.id, task.id, isCustom);
                      toast({ message: `Deleted “${task.name}”`, accent: "#94a3b8" });
                    }
                  : undefined
              }
            />
          </li>
        );
      })}
    </ul>
  );

  if (variant !== "panel") return list;

  return (
    <Panel flat className="p-4 sm:p-5" aria-labelledby="focus-title">
      <PanelTitle
        id="focus-title"
        icon={Crosshair}
        right={<span className="font-mono text-xs text-ink-3 tabular">{count} pinned</span>}
      >
        Focus
      </PanelTitle>
      <div className="mt-4">{list}</div>
    </Panel>
  );
}

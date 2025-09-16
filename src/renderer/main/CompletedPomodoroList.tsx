import { create } from "zustand";
import { ListedCompletedPomodoro } from "./ListedPomodoro";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import { useState } from "react";
import Warn from "../misc/Warn";
import { usePomodorosStore } from "./PomodoroList";

// TEMP: Move the stored pomodoro stuff elsewhere.
interface CompletedPomodoros {
  list: PomodoroTimerInfo[],
  setPomodoros: (list: PomodoroTimerInfo[]) => void,
  addPomodoro: (toAdd: PomodoroTimerInfo) => void,
  removePomodoro: (idx: number) => void,
	markPomodoroAsIncomplete: (idx: number) => void,
}

export const useCompletedPomodorosStore = create<CompletedPomodoros>(set => ({
  list: [],
  setPomodoros: (list: PomodoroTimerInfo[]) => set({list: list}),
  addPomodoro: (toAdd) => set(state => ({ list: [...state.list, toAdd] })),
  removePomodoro: (idxToRemove) => set(state => ({ list: state.list.filter((_, itemIdx) => itemIdx !== idxToRemove) })),
  markPomodoroAsIncomplete: (idxToMark) => {
      set(state => {
        const completedPomo = state.list[idxToMark];
        if (!completedPomo) return {};
        usePomodorosStore.getState().addPomodoro(completedPomo);
        return { list: state.list.filter((_, itemIdx) => itemIdx !== idxToMark) };
      });
    }
}))


export default function CompletedTasksMenu() {
    const storedPomos = useCompletedPomodorosStore(store => store.list);

    const [promptToDelete, setPromptToDelete] = useState<{state: boolean, idx?: number}>({state: false});
    const [promptToMarkAsComplete, setPromptToMarkAsComplete] = useState<{state: boolean, idx?: number}>({state: false});

		const removePomodoro = useCompletedPomodorosStore(store => store.removePomodoro);
    const markPomodoroAsIncomplete = useCompletedPomodorosStore(store => store.markPomodoroAsIncomplete);

    return <>
     {promptToDelete.state && <Warn 
          confirmText="Are you sure you want to delete this pomodoro permanently?"
          onYes={() => {
            removePomodoro(promptToDelete.idx); 
            setPromptToDelete({state: false});
          }}
          onNo={() => setPromptToDelete({state: false})}
        />}
        {promptToMarkAsComplete.state && <Warn 
          confirmText="Are you sure you want to mark this task as complete?"
          onYes={() => {
            console.log("TEAST")
            markPomodoroAsIncomplete(promptToMarkAsComplete.idx); 
            setPromptToMarkAsComplete({state: false});
          }}
          onNo={() => setPromptToMarkAsComplete({state: false})}
        />}

        <h1> Your Completed Pomos </h1>
        {storedPomos.length == 0 && <p>You have no completed pomodoros! 🍃</p>}
        {storedPomos.map((pomoInfo, idx) => <ListedCompletedPomodoro 
            info={pomoInfo} 
            key={idx} 
            onDelete={() => setPromptToDelete({state: true, idx: idx})}
            onMarkAsIncomplete={() => setPromptToMarkAsComplete({state: true, idx: idx})}
        />)}
    </>
}

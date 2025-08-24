import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import ListedPomodoro from "./ListedPomodoro";
import { useContext, useEffect, useState } from "react";
import Warn from "../misc/Warn";
import { AppContext } from "../App";
import { useWindowSizeStore } from "../../main/states/userDataStates";

interface Pomodoros {
    list: PomodoroTimerInfo[],
    setPomodoros: (list: PomodoroTimerInfo[]) => void,
    addPomodoro: (toAdd: PomodoroTimerInfo) => void,
    updatePomodoro: (idx: number, toReplace: PomodoroTimerInfo) => void,
    removePomodoro: (idx: number) => void,
    markPomodoroAsComplete: (idx: number) => void,
}

export const usePomodorosStore = create<Pomodoros>(set => ({
    // Temporary items for quick testing!
    list: [],
    setPomodoros: (list: PomodoroTimerInfo[]) => set({list: list}),
    addPomodoro: (toAdd) => set(state => ({list: [...state.list, toAdd]})),
    updatePomodoro: (idxToReplace, toReplace) => set(state => ({list: state.list.map((previous, idx) => (idx == idxToReplace ? toReplace : previous))})),
    removePomodoro: (idxToRemove) => {set(state => ({ list: state.list.filter((_, itemIdx) => itemIdx !== idxToRemove )  }))},
    markPomodoroAsComplete: (idxToMark) => {
      console.log("CALLED?", idxToMark)
      console.log(useCompletedPomodorosStore.getState().list)
      set(state => {
        console.log("CALLED?", state.list.map( item => item.task))
        const completedPomo = state.list[idxToMark];
        if (!completedPomo) return {};
        console.log("CALLED?", completedPomo)
        useCompletedPomodorosStore.getState().addPomodoro(completedPomo);
        console.log("HIHI")
        // useCompletedPomodorosStore.getState().addPomodoro(completedPomo);
        return { list: state.list.filter((_, itemIdx) => itemIdx !== idxToMark) };
      });
    }
}))

// TEMP: Move the stored pomodoro stuff elsewhere.
interface CompletedPomodoros {
  list: PomodoroTimerInfo[],
  setPomodoros: (list: PomodoroTimerInfo[]) => void,
  addPomodoro: (toAdd: PomodoroTimerInfo) => void,
  removePomodoro: (idx: number) => void
}

export const useCompletedPomodorosStore = create<CompletedPomodoros>(set => ({
  list: [],
  setPomodoros: (list: PomodoroTimerInfo[]) => set({list: list}),
  addPomodoro: (toAdd) => set(state => ({ list: [...state.list, toAdd] })),
  removePomodoro: (idxToRemove) => set(state => ({ list: state.list.filter((_, itemIdx) => itemIdx !== idxToRemove) }))
}))

export default function PomodoroList() {
	const [launchedPomo, setLaunchedPomo ] = useState<number>(null);
    const pomodoros = usePomodorosStore(state => state.list);
    const [promptToDelete, setPromptToDelete] = useState<{state: boolean, idx?: number}>({state: false});
    const [promptToMarkAsComplete, setPromptToMarkAsComplete] = useState<{state: boolean, idx?: number}>({state: false});
    
    const pomoList = usePomodorosStore(state => state.list);
    const updatePomodoro = usePomodorosStore(state => state.updatePomodoro);
    const removePomodoro = usePomodorosStore(state => state.removePomodoro);
    const markPomodoroAsComplete = usePomodorosStore(state => state.markPomodoroAsComplete);
    const windowWidth = useWindowSizeStore(state => state.width);
    const windowHeight = useWindowSizeStore(state => state.height);

    const launchPomo = (idx: number) => {
      window.pomodoro.createWindow(pomoList[idx], {width: windowWidth, height: windowHeight})
      setLaunchedPomo(idx);
    }

    useEffect(() => {
      window.pomodoro.onClosed( () => {
        setLaunchedPomo(null);
      })
    }, [])

    const appContext = useContext<AppContext>(AppContext);
    
    useEffect(() => {
      window.pomodoro.onPomodoroUpdate((data: PomodoroTimerInfo) => {
        if (launchedPomo != null) {
          updatePomodoro(launchedPomo, data);
          appContext.saveData();
        }
      });
      return () => {
          window.pomodoro.onUnsubUpdate();
      }
    }, [launchedPomo]);
    
    if (pomoList.length == 0) return <p>You have no saved pomodoros! 🍃</p>

  return <>
    {promptToDelete.state && <Warn 
      confirmText="Are you sure you want to delete this pomodoro?"
      onYes={() => {
        removePomodoro(promptToDelete.idx); 
        setPromptToDelete({state: false});
        appContext.saveData();
      }}
      onNo={() => setPromptToDelete({state: false})}
    />}
    {promptToMarkAsComplete.state && <Warn 
      confirmText="Are you sure you want to mark this task as complete?"
      onYes={() => {
        console.log("TEAST")
        markPomodoroAsComplete(promptToMarkAsComplete.idx); 
        setPromptToMarkAsComplete({state: false});
        appContext.saveData();
      }}
      onNo={() => setPromptToMarkAsComplete({state: false})}
    />}
    {pomodoros.map((pomoInfo, idx) => <ListedPomodoro 
      info={pomoInfo} 
      key={idx} 
      onUpdate={(newPomo) => updatePomodoro(idx, newPomo)}
      status={launchedPomo == null ? 'launchable' : (launchedPomo == idx ? 'launched' : 'cant launch')}
      onLaunch={() => launchPomo(idx)}
      onDelete={() => setPromptToDelete({state: true, idx: idx})}
      onMarkAsComplete={() => setPromptToMarkAsComplete({state: true, idx: idx})}
    />)}
  </>
}
import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import { ListedHomePomodoro } from "./ListedPomodoro";
import { useContext, useEffect, useState } from "react";
import Warn from "../misc/Warn";
import { AppContext } from "../App";
import { useWindowSizeStore } from "../../main/states/userDataStates";
import { useCompletedPomodorosStore } from "./CompletedPomodoroList";

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
      console.log(useCompletedPomodorosStore.getState().list)
      set(state => {
        console.log("trying to add!")
        const completedPomo = state.list[idxToMark];
        if (!completedPomo) return {};
        useCompletedPomodorosStore.getState().addPomodoro(completedPomo);
        console.log("added !", completedPomo)
        return { list: state.list.filter((_, itemIdx) => itemIdx !== idxToMark) };
      });
    }
}))


export default function PomodoroList() {
	  const [launchedPomo, setLaunchedPomo ] = useState<number>(null);
    const [promptToDelete, setPromptToDelete] = useState<{state: boolean, idx?: number}>({state: false});
    const [promptToMarkAsComplete, setPromptToMarkAsComplete] = useState<{state: boolean, idx?: number}>({state: false});
    
    const pomoList = usePomodorosStore(state => state.list);
    const updatePomodoro = usePomodorosStore(state => state.updatePomodoro);
    const removePomodoro = usePomodorosStore(state => state.removePomodoro);
    const markPomodoroAsComplete = usePomodorosStore(state => state.markPomodoroAsComplete);
    const windowWidth = useWindowSizeStore(state => state.width);
    const windowHeight = useWindowSizeStore(state => state.height);

    const launchPomo = (idx: number) => {
      window.pomodoro.launchPomodoroWindow(pomoList[idx], {width: windowWidth, height: windowHeight})
      setLaunchedPomo(idx);
    }

    useEffect(() => {
      window.pomodoro.onClosed( () => {
        setLaunchedPomo(null);
      })
    }, [])

    const appContext = useContext<AppContext>(AppContext);
    
    useEffect( () => {
      appContext.saveData({storedPomos: pomoList});
      console.log("Saving pomo list stuff", pomoList)
    }, [pomoList])

    if (pomoList.length == 0) return <p>You have no saved pomodoros! 🍃</p>

  return <>
    {promptToDelete.state && <Warn 
      confirmText="Are you sure you want to delete this pomodoro?"
      onYes={() => {
        removePomodoro(promptToDelete.idx); 
        setPromptToDelete({state: false});
      }}
      onNo={() => setPromptToDelete({state: false})}
    />}
    {promptToMarkAsComplete.state && <Warn 
      confirmText="Are you sure you want to mark this task as complete?"
      onYes={() => {
        markPomodoroAsComplete(promptToMarkAsComplete.idx); 
        setPromptToMarkAsComplete({state: false});
      }}
      onNo={() => setPromptToMarkAsComplete({state: false})}
    />}
    {pomoList.map((pomoInfo, idx) => <ListedHomePomodoro 
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
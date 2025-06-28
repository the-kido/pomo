import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import ListedPomodoro from "./ListedPomodoro";
import { useEffect, useState } from "react";
import Warn from "../misc/Warn";

interface Pomodoros {
    list: PomodoroTimerInfo[],
    addPomodoro: (toAdd: PomodoroTimerInfo) => void,
    updatePomodoro: (idx: number, toReplace: PomodoroTimerInfo) => void,
    removePomodoro: (idx: number) => void,
}

export const usePomodorosStore = create<Pomodoros>(set => ({
    // Temporary items for quick testing!
    list: [],
    addPomodoro: (toAdd) => set(state => ({list: [...state.list, toAdd]})),
    updatePomodoro: (idxToReplace, toReplace) => set(state => ({list: state.list.map((previous, idx) => (idx == idxToReplace ? toReplace : previous))})),
    removePomodoro: (idxToRemove) => {set(state => ({ list: state.list.filter((_, itemIdx) => itemIdx !== idxToRemove )  }))}
}))

export default function PomodoroList() {
	const [launchedPomo, setLaunchedPomo ] = useState<number>(null);
    const pomodoros = usePomodorosStore(state => state.list);
    const [promptToDelete, setPromptToDelete] = useState<{state: boolean, idx?: number}>({state: false});
    
    const pomoList = usePomodorosStore(state => state.list);
    const updatePomodoro = usePomodorosStore(state => state.updatePomodoro);
    const removePomodoro = usePomodorosStore(state => state.removePomodoro);

    const launchPomo = (idx: number) => {
		window.pomodoro.createWindow(pomoList[idx], {width: /*300*/ 1200, height: 500})
		setLaunchedPomo(idx);
	}

    useEffect(() => {
        window.pomodoro.onClosed( () => {
			setLaunchedPomo(null);
		})
    }, [])

    useEffect(() => {
        window.pomodoro.onUpdate((data: PomodoroTimerInfo) => {
            if (launchedPomo != null) updatePomodoro(launchedPomo, data);
        });
        return () => {
            window.pomodoro.onUnsubUpdate();
        }
    }, [launchedPomo]);
    
    if (pomoList.length == 0) return <p>You have no saved pomodoros! 🍃</p>

    return <>
        {promptToDelete.state && <Warn 
            confirmText="Are you sure you want to delete this pomodoro?"
            onYes={() => {removePomodoro(promptToDelete.idx); setPromptToDelete({state: false})}}
            onNo={() => setPromptToDelete({state: false})}
        />}
        {pomodoros.map((pomoInfo, idx) => <ListedPomodoro 
            info={pomoInfo} 
            key={idx} 
            onUpdate={(newPomo) => updatePomodoro(idx, newPomo)}
            status={launchedPomo == null ? 'launchable' : (launchedPomo == idx ? 'launched' : 'cant launch')}
            onLaunch={() => launchPomo(idx)}
            onDelete={() => setPromptToDelete({state: true, idx: idx})}
        />)}
    </>
}
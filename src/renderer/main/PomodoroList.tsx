import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import ListedPomodoro from "./ListedPomodoro";
import { useState } from "react";

interface Pomodoros {
    list: PomodoroTimerInfo[],
    addPomodoro: (toAdd: PomodoroTimerInfo) => void,
    updatePomodoro: (idx: number, toReplace: PomodoroTimerInfo) => void,
    removePomodoro: (toRemove: PomodoroTimerInfo) => void,
}

export const usePomodorosStore = create<Pomodoros>(set => ({
    // Temporary items for quick testing!
    list: [{
        received: false,
        startTimeSeconds: 2,
        breakTimeSeconds: 4,
        task: 'Finish Assigment 4 Due In Two Weeks',
        subtasks: [
            "Do small thing", 
            "And other thing",
            "But this is the last thing!",
            "NONO BUT THIS THING FOR REAL IM NOT JOKING!!",
        ],
        type: 'active',
        goal: 'fafw',
        motivation: 'a',
        nextReward: 'Make a smoothie',
        completed: 0,
    },
    {
        received: false,
        startTimeSeconds: 2,
        breakTimeSeconds: 4,
        task: 'Slack Off',
        subtasks: [
            "Do small thing", 
            "And other thing",
            "But this is the last thing!",
            "NONO BUT THIS THING FOR REAL IM NOT JOKING!!",
        ],
        type: 'active',
        goal: 'fafw',
        motivation: 'a',
        nextReward: 'b',
        completed: 0,
    }],
    addPomodoro: (toAdd) => set(state => ({list: [...state.list, toAdd]})),
    updatePomodoro: (idxToReplace, toReplace) => set(state => ({list: state.list.map((previous, idx) => (idx == idxToReplace ? toReplace : previous))})),
    removePomodoro: (toRemove) => null
}));

export default function PomodoroList() {
	const [launchedPomo, setLaunchedPomo ] = useState<number>(null);
    const pomodoros = usePomodorosStore(state => state.list);
    
    const pomoList = usePomodorosStore(state => state.list);
    const updatePomodoro = usePomodorosStore(state => state.updatePomodoro);

    const launch = (idx: number) => {
		window.pomodoro.createWindow(pomoList[idx], {width: /*300*/ 1200, height: 500})
		setLaunchedPomo(idx);

		window.pomodoro.onClosed( () => {
			console.log("closed!")
			setLaunchedPomo(null);
		} )
	}

    return <>
        {pomodoros.map((pomoInfo, idx) => <ListedPomodoro 
            info={pomoInfo} 
            key={idx} 
            onUpdate={(newPomo) => updatePomodoro(idx, newPomo)}
            status={launchedPomo == null ? 'launchable' : (launchedPomo == idx ? 'launched' : 'cant launch')}
            onLaunch={() => launch(idx)}
        />)}
    </>
}
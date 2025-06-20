import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import ListedPomodoro from "./ListedPomodoro";

interface Pomodoros {
    list: PomodoroTimerInfo[],
    addPomodoro: (toAdd: PomodoroTimerInfo) => void,
    updatePomodoro: (idx: number, toReplace: PomodoroTimerInfo) => void,
    removePomodoro: (toRemove: PomodoroTimerInfo) => void,
}

export const usePomodorosStore = create<Pomodoros>(set => ({
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
        nextReward: 'b',
        completed: 0,
    }],
    // temp
    addPomodoro: (toAdd) => set({list: [toAdd]}),
    updatePomodoro: (idxToReplace, toReplace) => {
        console.log("hello", idxToReplace, toReplace)
        set(state => { 
            state.list[idxToReplace] = {...toReplace};
            
            return { list: state.list.map((previous, idx) => ( idx == idxToReplace ? toReplace : previous ))}
        });
    },
    removePomodoro: (toRemove) => null
}));


export default function PomodoroList() {
    const pomodoros = usePomodorosStore(state => state.list);
    const updatePomodoro = usePomodorosStore(state => state.updatePomodoro);

    return <>
        {pomodoros.map((element, idx) => <ListedPomodoro info={element} key={idx} onUpdate={(newPomo) => updatePomodoro(idx, newPomo) }/> )}
    </>
}
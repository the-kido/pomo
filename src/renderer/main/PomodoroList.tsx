import { create } from "zustand";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import ListedPomodoro from "./ListedPomodoro";

interface Pomodoros {
    list: PomodoroTimerInfo[],
    addPomodoro: (toAdd: PomodoroTimerInfo) => void,
    updatePomodoro: (previous: PomodoroTimerInfo, toReplace: PomodoroTimerInfo) => void,
    removePomodoro: (toRemove: PomodoroTimerInfo) => void,
}

const usePomodorosStore = create<Pomodoros>(set => ({
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
    updatePomodoro: (previous, toReplace) => null,
    removePomodoro: (toRemove) => null
}));


export default function PomodoroList() {
    const pomodoros = usePomodorosStore(state => state.list);

    return <>
        {pomodoros.map((element, idx) => <ListedPomodoro info={element} key={idx}/> )}
    </>
}
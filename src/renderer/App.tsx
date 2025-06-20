import { useState } from "react";
import CreatePomodoro from "./main/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";

export default function App()
{
    // Band-aid solution to "entirely" reset CreatePomodoro
    // I may attempt a better solution in the future but this work around is very effective
    const [key, setKey] = useState<number>(0);
    
    return <>
        <h1>
            Create a Pomodoro
        </h1>
        <CreatePomodoro key={key} reset={() => setKey(key => key + 1)}/>
        <h1>
            Previous
        </h1>
        <PomodoroList/>
    </> 
}
import { useState } from "react";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import CreatePomodoro from "./CreatePomodoro";

/*
Represents an entry of a created pomodoro timer within the
pomodoro list present on the main screen.

   // Listed in order of what is inputted by the pomodoro creator
    GOOD type: "active" | "chill" | "unknown",
    GOOD goal?: string,
    GOOD task: string,
    NOT REQUIRED motivation: string,
    GOOD nextReward: string,
    GOOD subtasks: string[]
    startTimeSeconds: number,
    breakTimeSeconds: number,
    received: boolean
    completed: number
*/

export default function ListedPomodoro({info} : {info: PomodoroTimerInfo}) {
    const [editing, setEditing] = useState<boolean>(false);


    if (editing) {
        return <CreatePomodoro info={info} />
    }

    return <div className="listed-pomodoro">
        <div className="task">{info.task}</div>

        <div className="listed-pomodoro-content">

            {/* Left */}
            <div>
                {/* Type Stage */}
                <div style={{display: 'flex'}}> 
                    {/* ⚠️ TEMP */}
                    <h4>{info.type}</h4>
                    { info.type == 'active' && <h4>{info.goal}</h4> }
                </div>
                {/* Task Stage*/}
                <div> 
                    Created in order to <span>{info.motivation}</span> 
                </div>
                {/* Select First Reward Stage*/}
                <div> 
                    Next Reward: <span>{info.nextReward}</span>
                </div>
            </div>
            
            {/* Right */}
            <div>
                {info.subtasks.map( (subtask, id) => <li key={id}> {subtask} </li>
                )}
            </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }} >
            <button onClick={() => setEditing(true)} > Edit </button>
            <button> Launch 🚀 </button>
        </div>
    </div>
}
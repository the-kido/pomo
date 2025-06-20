import { useState } from "react";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";
import CreatePomodoro from "./CreatePomodoro";

interface ListedPomodoroProps { info: PomodoroTimerInfo, onUpdate: (newPomo: PomodoroTimerInfo) => void, status: 'launched' | 'launchable' | 'cant launch', onLaunch: () => void }

/*
Represents an entry of a created pomodoro timer within the
pomodoro list present on the main screen.
*/
export default function ListedPomodoro({info, onUpdate, status, onLaunch}: ListedPomodoroProps) {
    const [editing, setEditing] = useState<boolean>(false);

    const onSaved = (newPomo: PomodoroTimerInfo ) => {
        onUpdate(newPomo);
        setEditing(false);
    }

    if (editing) {
        return <CreatePomodoro onSaved={onSaved} info={info} />
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
        <div style={{ display: 'flex', marginTop: '10px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={status == 'launched'} onClick={() => setEditing(true)} > Edit </button>
                <button disabled={status != 'launchable'} onClick={() => onLaunch()} > { status != 'launched' ? 'Launch 🚀' : 'Launched' } </button>
            </div>
            {/* <p className="pomo-count">🍅 x{info.completed}</p> */}
        </div>
    </div>
}
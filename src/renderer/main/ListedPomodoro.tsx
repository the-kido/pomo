import { useContext, useState } from "react";
import { PomoActivityType, PomoActivityTypeDisplay, PomodoroTimerInfo } from "/src/types/Pomodoro";
import CreatePomodoro from "./createPomodoro/CreatePomodoro";
import { AppContext } from "../App";
import { Check } from "lucide-react";

interface ListedPomodoroProps { info: PomodoroTimerInfo, onUpdate: (newPomo: PomodoroTimerInfo) => void, status: 'launched' | 'launchable' | 'cant launch', onLaunch: () => void, onDelete: () => void, onMarkAsComplete: () => void }

/*
Represents an entry of a created pomodoro timer within the
pomodoro list present on the main screen.
*/
export default function ListedPomodoro({info, onUpdate, status, onLaunch, onDelete, onMarkAsComplete }: ListedPomodoroProps) {
	
	const [editing, setEditing] = useState<boolean>(false);
	
	const onSaved = (newPomo: PomodoroTimerInfo) => {
		onUpdate(newPomo);
		setEditing(false);
	}
	
	if (editing) return <CreatePomodoro onSaved={onSaved} info={info} />
	
	return <div className="listed-pomodoro">
		<div style={{display: 'flex', justifyContent: 'space-between' }} >
			<div className="pomo-header" style={{left: '1rem'}}>
				{info.task}
			</div>
			<div className="pomo-header" style={{left: 'calc(100% - 4rem)'}}> {`🍅 x${info.completed}`}</div>
		</div>

		<div className="listed-pomodoro-content">
			{/* Left */}
			<div className="listed-pomodoro-content-left">
				{/* Type Stage */}
				<div style={{display: 'flex'}}> 
					{/* ⚠️ TEMP */}
					<h4>{PomoActivityTypeDisplay[info.type]}</h4>
					{ info.type == PomoActivityType.ACTIVE && <h4>{info.goal}</h4> }
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
			<div className="listed-pomodoro-content-">
				{info.subtasks.length != 0 && <h3>Subtasks</h3>}
				<div>
					{info.subtasks.map((subtask, index) => <div key={index}>
						<span style={{
							fontWeight: '400', 
							marginRight: '10px', 
						}}> 
							{`${index + 1}.`}
						</span>
						<span style={{
							textDecoration: (info.subtasksCompletedIndicies || []).includes(index) ? 'line-through' : 'none' 
						}}>
							{subtask} 
						</span>
					</div>)}
				</div>
			</div>
		</div>

		<div style={{ display: 'flex', marginTop: '10px', justifyContent: 'space-between', width: '100%' }}>
			<div style={{ display: 'flex', gap: '8px'}}>
				<button disabled={status == 'launched'} onClick={() => setEditing(true)} > Edit </button>
				<button disabled={status != 'launchable'} onClick={() => onLaunch()} > { status != 'launched' ? 'Launch 🚀' : 'Launched' } </button>
			</div>
			<div style={{ display: 'flex', gap: '8px'}}>
				<button onClick={() => onMarkAsComplete()} > <Check /> </button>
				<button onClick={() => onDelete()} > 🗑️ </button>
			</div>
		</div>
	</div>
}
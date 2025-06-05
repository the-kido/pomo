import { createContext, CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { PomodoroTimerInfo } from "src/types/Global"
// import { GripVertical } from 'lucide-react';

type SubtasksType = {
  subtasks: string[];
  setSubtasks: React.Dispatch<React.SetStateAction<string[]>>;
};

const Subtasks = createContext<SubtasksType | undefined>(undefined);

function Subtask({subtask, index} : {subtask: string, index: number}) {
	const subtaskContext = useContext(Subtasks);

	return <h3 style={{userSelect: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
			{ `${index}. ${subtask}` }
			<div>
				<button onClick={() => subtaskContext.setSubtasks(  subtaskContext.subtasks.filter( (_, i) => i != index  ) ) } >X</button>
				{/* <GripVertical /> */}
			</div>
	</h3>
}

function SubtaskList() {
	const listRef = useRef<HTMLUListElement>(null);
	const subtaskContext = useContext(Subtasks);
	
	useEffect(() => {
		if (listRef.current) {
				listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [subtaskContext.subtasks]);

	return <>
		<ul ref={listRef} style={{padding: '0px', overflowY: 'scroll', height: '200'}}>
				{subtaskContext.subtasks.map((task, index) => (
					<Subtask key={index} subtask={task} index={index}/>
				))}
			<AddComponent />
		</ul>
	</>
}

function AddComponent() {
	const [newTask, setNewTask] = useState<string>('')
	const subtaskContext = useContext(Subtasks);
	

	const onAddSubtaskPressed = () => {
		subtaskContext.setSubtasks([...subtaskContext.subtasks, newTask])
		setNewTask('')
	}
	
	return 	<div>
			Add: 
			<input
				value={newTask}
				onChange={(newTask) => {setNewTask(newTask.target.value)}} 
				type='text'
				/>
			<button 
				disabled={newTask == ''}
				onClick={onAddSubtaskPressed} 
				>
				Add
			</button>
		</div>
}

function PomodoroModule() {
	const [isPomodoroActive, setPomodoroActive ] = useState<boolean>(false);
	const [time, setTime] = useState<number>(0); 
	const [reason, setReason] = useState<string>("");
	const [subtasks, setSubtasks] = useState<string[]>(["aas", "bas", "cas", "das"]);

	useEffect(() => {
		// window.pomodoro.onUpdate((data: PomodoroTimerInfo) => {
		// 	console.log("DATA!", data);
		// });
	}, [time])

	const isStartButtonDisabled = () => {
		return isPomodoroActive || time == 0 || reason == ''
	}

	const renderMainContent = () => {
		return <Subtasks.Provider value={{subtasks, setSubtasks}}  >
			<div style={{ display: 'flex', flexDirection: 'row' }} >
				<p>Time: </p>
				<input type="number" onChange={(e) => setTime(Number(e.target.value))}></input>
				<p>minutes </p>
			</div>
			<div style={{ display: 'flex' , flexDirection: 'row' }} >
				<p> Reason: </p>
				<input defaultValue="" onChange={(e) => setReason(e.target.value)} ></input>
			</div>

			<SubtaskList />
			<button disabled={ isStartButtonDisabled() } onClick={() => startPomodoro()} >Start Pomodoro </button>
		</Subtasks.Provider>
	}

	const startPomodoro = () => {
		const info: PomodoroTimerInfo = {
			mainTask: reason,
			startTimeSeconds: time * 60,
			received: true,
			breakTimeSeconds: 300,
			subtasks: subtasks
		};

		// window.pomodoro.createWindow(info, {width: /*300*/ 800, height: 500})
		// setPomodoroActive(true);

		// console.log(window.pomodoro.onClosed);
		// window.pomodoro.onClosed( () => {
		// 	console.log("closed!")
		// 	setPomodoroActive(false);
		// } )
	}

	return <>
        <h1> whaa</h1>
        {renderMainContent()}
	</>
}

export default PomodoroModule;
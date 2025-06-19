import { createContext, CSSProperties, useContext, useEffect, useRef, useState } from "react";
import { useGoalStore, usePomodoroTimerStore, useRewardsStore } from "/src/main/states/states"
import { PomodoroTimerInfo } from "/src/types/Pomodoro"
// import { GripVertical } from 'lucide-react';

type SubtasksType = {
  subtasks: string[];
  setSubtasks: React.Dispatch<React.SetStateAction<string[]>>;
};

const Subtasks = createContext<SubtasksType | undefined>(undefined);


type StagesCompletedType = {
	stages: Stages[], 
	setStages: React.Dispatch<React.SetStateAction<Stages[]>>,
};

const StagesCleared = createContext<StagesCompletedType | undefined>(undefined);

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

function SubtaskList({stageAt} : {stageAt: Stages} ) {
	const listRef = useRef<HTMLUListElement>(null);
	const subtaskContext = useContext(Subtasks);
	
	useEffect(() => {
		if (listRef.current) {
				listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [subtaskContext.subtasks]);

	const stagesCompletedContext = useContext(StagesCleared);
	updateStageCleared(true, Stages.SUBTASKS, stagesCompletedContext, stageAt);

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

enum Stages {
	TYPE, TASK, FIRST_REWARD, SUBTASKS
}

function updateStageCleared(isCompleted: boolean, stage: Stages, stagesClearedContext: StagesCompletedType, stageAt: Stages) {
	console.log(isCompleted, stage, stagesClearedContext.stages);
	if (stage <= stageAt && isCompleted && !stagesClearedContext.stages.includes(stage)) { 
		stagesClearedContext.setStages([...stagesClearedContext.stages, stage]) 
	} else if (!isCompleted && stagesClearedContext.stages.includes(stage)) {
		stagesClearedContext.setStages(stagesClearedContext.stages.filter( (stageCleared) => stageCleared != stage ) )
	}
}

function TypeStage(props: {stageAt: Stages, onSetType: (type: "active" | "chill" | "unknown") => void, onSetGoal: (goal: string) => void }) {
	const [type, setType] = useState<"active" | "chill" | "unknown">("unknown");
	const [goal, setGoal] = useState<string>("");
	const goals = useGoalStore((state) => state.goals);

	const stagesClearedContext = useContext(StagesCleared);
	useEffect(() => {
		const isCompleted = type == 'chill' || type == 'active' && goal != '';
		updateStageCleared(isCompleted, Stages.TYPE, stagesClearedContext, props.stageAt);
	}, [type, goal])

	return <>
		{/* Temporary; use "slider" selection instead */}
		<select value={type} onChange={e => { setType(e.target.value as "active" | "chill"); props.onSetType(e.target.value as "active" | "chill") }}>
			<option value="unknown">Select</option>
			<option value="chill">Chill</option>
			<option value="active">Active</option>
		</select>
		{
			// Temporary: Select between all the missions that we've created
			type == "active" && <select value={goal} onChange={e => { setGoal(e.target.value); props.onSetGoal(e.target.value) }}>
				{goals.map((goal, i) => <option value={goal} key={i}> {goal} </option>)}
			</select>
		}
	</>
}

function TaskStage(props: {stageAt: Stages, onTaskChanged: (str: string) => void, onMotivationChanged: (str: string) => void })
{
	const [task, setTask] = useState<string>('');
	const [motivation, setMotivation] = useState<string>('');

	const stagesCompletedContext = useContext(StagesCleared)

	useEffect( () => {
		const isCompleted = task != '' && motivation != '';
		updateStageCleared(isCompleted, Stages.TASK, stagesCompletedContext, props.stageAt);
	}, [task, motivation])

	return <div style={border}>
		<p style={{margin: '0px'}} > I will <input type="text" onChange={(e) => { setTask(e.target.value); props.onTaskChanged(e.target.value) }} ></input> <br></br>
		in order to <input type="text" onChange={(e) => { setMotivation(e.target.value); props.onMotivationChanged(e.target.value) }}></input>
		 </p>
	</div>
}

function SelectFirstRewardStage({ stageAt, onRewardChanged }: {stageAt: Stages, onRewardChanged: (str: string) => void }) {
	const [reward, setReward] = useState<string>("");
	const rewards = useRewardsStore((state) => state.rewards);

	const stagesCompletedContext = useContext(StagesCleared)
	
	// TODO: Change time if wanted.
	const breakTime = usePomodoroTimerStore((store) => store.breakTime);
	const longBreakTime = usePomodoroTimerStore((store) => store.longBreakTime);

	useEffect( () => {
		const isCompleted = reward != "";
		updateStageCleared(isCompleted, Stages.FIRST_REWARD, stagesCompletedContext, stageAt);
	}, [reward])

	return <div style={border}>
		<h3> Initial things: </h3>
		<p> Reward:  
		<select onChange={(e) => { setReward(e.target.value); onRewardChanged(e.target.value) }}> 
			{rewards.map( (reward, i) => <option value={reward} key={i}> {reward} </option>   ) }
		</select>
		</p>
	</div>
}

const border: CSSProperties = {
	border: "2px solid #ccc",
	borderRadius: "8px",
	padding: "4px",
	marginTop: '10px',
	width: '300px'
}

function PomodoroModule() {
	const stagesRequired = [ Stages.TYPE, Stages.TASK, Stages.FIRST_REWARD, Stages.SUBTASKS];
	
	const [isPomodoroActive, setPomodoroActive ] = useState<boolean>(false);
	const [time, setTime] = useState<number>(0); 
	const [reason, setReason] = useState<string>("");
	const [subtasks, setSubtasks] = useState<string[]>(["aas", "bas", "cas", "das"]);
	const [stagesCleared, setStagesCleared] = useState<Stages[]>([]);
	const [stageAt, setStageAt] = useState<Stages>(stagesRequired[0]);
	const [test, setTest] = useState<PomodoroTimerInfo>({
		type: 'unknown',
		task: '',
		motivation: '',
		nextReward: '',
		subtasks: [],
		startTimeSeconds: 25 * 60,
		breakTimeSeconds: 300,
		received: false
	});

	// Temporary; should be replaced by a store
	useEffect(() => {
		window.pomodoro.onUpdate((data: PomodoroTimerInfo) => {
			console.log("DATA!", data);
		});
	}, [time])
	
	// Update stageAt whenever stagesCleared is updated
	useEffect(() => {
		// If no stages are complete, then the stage at is just the first required stage.
		// If 1 or more stages is complete, then the stage at is the stage *after* the completed stage.
		

		if (stagesCleared.length == 0) setStageAt(stagesRequired[0]);
		else {
			let largest = stagesCleared[0];
			stagesCleared.forEach(stage => {
				largest = Math.max(largest, stage);
			});
			let newIndex = Math.min(stagesRequired.indexOf(largest) + 1, stagesRequired.length - 1);
			setStageAt(newIndex);
		}

	}, [stagesCleared, stageAt])

	const isStartButtonDisabled = () => {
		console.log(stagesCleared);
		console.log(stagesRequired);
		return !stagesRequired.every(required => stagesCleared.includes(required));
	}

	
	console.log("Updated pomo:", test);
	
	const onSetType = (string: "active" | "chill" | "unknown") => {
		test.type = string
	}
	
	const onSetGoal = (string: string) => {
		test.goal = string
	}
	
	const onTaskChanged = (string: string) => {
		test.task = string
	}
	
	const onMotivationChanged = (string: string) => {
		test.motivation = string
	}
	
	const onRewardChanged = (string: string) => {
		test.nextReward = string
	}

	const startPomodoro = () => {
		test.subtasks = subtasks;
		window.pomodoro.createWindow(test, {width: /*300*/ 1200, height: 500})
		setPomodoroActive(true);

		console.log(window.pomodoro.onClosed);
		window.pomodoro.onClosed( () => {
			console.log("closed!")
			setPomodoroActive(false);
		} )
	}


	return <Subtasks.Provider value={{subtasks, setSubtasks}}> <div className="creator"> 
			<div className="creator-content">
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				
			{/* Left */}
			<StagesCleared.Provider value={{ stages: stagesCleared, setStages: setStagesCleared }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
					{stagesRequired.includes(Stages.TYPE) && stageAt >=	Stages.TYPE && <TypeStage stageAt={stageAt} onSetGoal={ onSetGoal } onSetType={ onSetType }/>}
					{stagesRequired.includes(Stages.TASK) && stageAt >= Stages.TASK && < TaskStage stageAt={stageAt} onTaskChanged={ onTaskChanged } onMotivationChanged={ onMotivationChanged } />}
					{stagesRequired.includes(Stages.FIRST_REWARD) && stageAt >= Stages.FIRST_REWARD && <SelectFirstRewardStage stageAt={stageAt} onRewardChanged={onRewardChanged} />}
				</div>
				{/* Right */}
				<div>
					{stagesRequired.includes(Stages.SUBTASKS) && stageAt >= Stages.SUBTASKS && <SubtaskList stageAt={stageAt} />}
				</div>
			</StagesCleared.Provider>
			</div>
		
		</div>
		<button disabled={ isStartButtonDisabled() } onClick={() => startPomodoro()} >Start Pomodoro </button>
	</div> </Subtasks.Provider> 
}

export default PomodoroModule;
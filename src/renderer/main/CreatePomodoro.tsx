import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGoalStore, useRewardsStore } from "/src/main/states/states"
import { PomoActivityType, PomoActivityTypeDisplay, PomodoroTimerInfo } from "/src/types/Pomodoro"
import { usePomodorosStore } from "./PomodoroList";
import { AppContext } from "../App";

const NONE: string = "None"
const PLEASE_SELECT: string = "Please Select"

type StagesCompletedType = {
	stages: Stages[], 
	setStages: React.Dispatch<React.SetStateAction<Stages[]>>,
};

const StagesCleared = createContext<StagesCompletedType | undefined>(undefined);

function Subtask({subtask, index, onRemove} : {subtask: string, index: number, onRemove: () => void}) {
	return <div className="subtask">
		<div>
			<span style={{fontWeight: '400', marginRight: '10px'}}>{`${index + 1}.`}</span>{subtask}
		</div> 
		<button className="delete-button" onClick={onRemove} >
			<span className="delete-button-x">✖</span>
		</button>
	</div>
}

function SubtaskList({info, stageAt, onSubtasksChanged} : {info? : PomodoroTimerInfo, stageAt: Stages, onSubtasksChanged: (subtasks: string[]) => void} ) {
	const listRef = useRef<HTMLUListElement>(null);
	const [subtasks, setSubtasks] = useState<string[]>(info ? info.subtasks : []);
	
	const stagesCompletedContext = useContext(StagesCleared);
	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
		updateStageCleared(true, Stages.SUBTASKS, stagesCompletedContext, stageAt);
	}, [subtasks]);

	return <>
		<ul ref={listRef} className="subtasks">
				{subtasks.map((task, index) => (
					<Subtask key={index} subtask={task} index={index} onRemove={() => { 
						var newSubtasks = subtasks.filter((_, i) => i != index);
						setSubtasks(newSubtasks); onSubtasksChanged(newSubtasks) 
					}}/>
				))}
			<AddSubtask subtasks={subtasks} setSubtasks={(newSubtasks) => { setSubtasks(newSubtasks); onSubtasksChanged(newSubtasks) }} />
		</ul>
	</>
}

function AddSubtask({ subtasks, setSubtasks}: {subtasks: string[], setSubtasks: (subtasks: string[]) => void}) {
	const [newTask, setNewTask] = useState<string>('')
	const input = useRef<HTMLInputElement>(null);

	const onAddSubtaskPressed = () => {
		setSubtasks([...subtasks, newTask])
		setNewTask('')
		input.current.value = ''
	}
	
	return <p className="subtask">
		{ `${subtasks.length + 1}.` } 
		<input
			ref={input}
			type="text" 
			className="inline-input" 
			onChange={(newTask) => {setNewTask(newTask.target.value)}}
			placeholder="Add a subtask"
		/>
		<button disabled={newTask == ''} onClick={onAddSubtaskPressed}>
			Add
		</button>
	</p>
}

enum Stages {
	TYPE, TASK, FIRST_REWARD, SUBTASKS
}

function updateStageCleared(isCompleted: boolean, stage: Stages, stagesClearedContext: StagesCompletedType, stageAt: Stages) {
	if (stage <= stageAt && isCompleted && !stagesClearedContext.stages.includes(stage)) { 
		stagesClearedContext.setStages([...stagesClearedContext.stages, stage]) 
	} else if (!isCompleted && stagesClearedContext.stages.includes(stage)) {
		stagesClearedContext.setStages(stagesClearedContext.stages.filter( (stageCleared) => stageCleared != stage ) )
	}
}

function TypeStage(props: {info? : PomodoroTimerInfo, stageAt: Stages, onSetType: (type: PomoActivityType) => void, onSetGoal: (goal: string) => void }) {
	const [type, setType] = useState<PomoActivityType>(props.info ? props.info.type : PomoActivityType.UNKNOWN);
	const [goal, setGoal] = useState<string>(props.info ? props.info.goal : PLEASE_SELECT);
	const goals = useGoalStore((state) => state.goals);

	const stagesClearedContext = useContext(StagesCleared);
	
	useEffect(() => {
		const isCompleted = type == PomoActivityType.CHILL || type == PomoActivityType.ACTIVE && goal != PLEASE_SELECT;
		updateStageCleared(isCompleted, Stages.TYPE, stagesClearedContext, props.stageAt);
	}, [type, goal])

	return <>
		{/* Temporary; use "slider" selection instead */}
		<select value={type} onChange={e => { setType(e.target.value as unknown as PomoActivityType); props.onSetType(e.target.value as unknown as PomoActivityType) }}>
			<option value="unknown">Select</option>
			<option className="divider-option" disabled>──────────</option>
			<option value={PomoActivityType.ACTIVE}>{PomoActivityTypeDisplay[PomoActivityType.ACTIVE]}</option>
			<option value={PomoActivityType.CHILL}>{PomoActivityTypeDisplay[PomoActivityType.CHILL]}</option>
		</select>
		{ type == PomoActivityType.ACTIVE && <select value={goal} onChange={e => { setGoal(e.target.value); props.onSetGoal(e.target.value) }}>
			<option value={PLEASE_SELECT}>{PLEASE_SELECT}</option>
			<option className="divider-option" disabled>──────────</option>
			<option value={NONE} key={-1}>{NONE}</option>
			{goals.map((goal, i) => <option value={goal} key={i}> {goal} </option>)}
		</select> }
	</>
}

function TaskStage(props: {info? : PomodoroTimerInfo, stageAt: Stages, onTaskChanged: (str: string) => void, onMotivationChanged: (str: string) => void }) {
	const [task, setTask] = useState<string>(props.info ? props.info.task : '');
	const [motivation, setMotivation] = useState<string>(props.info ? props.info.motivation : '');

	const stagesCompletedContext = useContext(StagesCleared)

	useEffect(() => {
		const isCompleted = task != '' && motivation != '';
		updateStageCleared(isCompleted, Stages.TASK, stagesCompletedContext, props.stageAt);
	}, [task, motivation])

	return <div className="section">
		<p style={{margin: '0px'}} > I will <input type="text" className="inline-input" defaultValue={task} onChange={(e) => { setTask(e.target.value); props.onTaskChanged(e.target.value) }} ></input> <br></br>
		in order to <input type="text" className="inline-input" defaultValue={motivation} onChange={(e) => { setMotivation(e.target.value); props.onMotivationChanged(e.target.value) }}></input>
		 </p>
	</div>
}

function SelectFirstRewardStage({info, stageAt, onRewardChanged }: {info? : PomodoroTimerInfo, stageAt: Stages, onRewardChanged: (str: string) => void }) {
	const [reward, setReward] = useState<string>(info ? info.nextReward : PLEASE_SELECT);
	const rewards = useRewardsStore((state) => state.rewards);

	const stagesCompletedContext = useContext(StagesCleared)
	
	/* TODO: Change time if wanted.
	const breakTime = usePomodoroTimerStore((store) => store.breakTime);
	const longBreakTime = usePomodoroTimerStore((store) => store.longBreakTime);
	*/

	useEffect( () => {
		const isCompleted = reward != PLEASE_SELECT;
		updateStageCleared(isCompleted, Stages.FIRST_REWARD, stagesCompletedContext, stageAt);
	}, [reward])

	return <div className="section">
		<h3> Initial things: </h3>
		<p> Reward:  
		<select className="inline-input" defaultValue={info ? reward : PLEASE_SELECT} onChange={(e) => { setReward(e.target.value); onRewardChanged(e.target.value) }}> 
			<option value={PLEASE_SELECT}>{PLEASE_SELECT}</option>
			<option className="divider-option" disabled>──────────</option>
			<option value={NONE} key={-1}>{NONE}</option>
			{rewards.map( (reward, i) => <option value={reward} key={i}> {reward} </option>   ) }
		</select>
		</p>
	</div>
}

function CreatePomodoro({info, onSaved, reset} : {info? : PomodoroTimerInfo, onSaved?: (newPomo: PomodoroTimerInfo) => void, reset?: () => void}) {
	const stagesRequired = [ Stages.TYPE, Stages.TASK, Stages.FIRST_REWARD, Stages.SUBTASKS ];
	
	const [stagesCleared, setStagesCleared] = useState<Stages[]>(info ? stagesRequired : []);
	const [stageAt, setStageAt] = useState<Stages>(info ? Stages.SUBTASKS : stagesRequired[0]);
	const [newPomo, _] = useState<PomodoroTimerInfo>(info ? {...info} : {
		type: PomoActivityType.UNKNOWN,
		task: '',
		motivation: '',
		nextReward: '',
		subtasks: [],
		startTimeSeconds: 25 * 60,
		breakTimeSeconds: 300,
		received: false,
		completed: 0,
		timeCreated: Date.now(),
	});

	const addPomodoro = usePomodorosStore(store => store.addPomodoro)
	
	const appContext = useContext<AppContext>(AppContext);

	const createPomodoro = () => {
		addPomodoro(newPomo);
		reset();
		appContext.saveData();
	}
	
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

	const isStartButtonDisabled = () => !stagesRequired.every(required => stagesCleared.includes(required));
	
	const canEnterStage = (stage: Stages) => stagesRequired.includes(stage) && stageAt >= stage;
	
	const savePomodoro = () => onSaved(newPomo);
	const cancelUpdate = () => onSaved(info);
	
	const onSetType = (string: PomoActivityType) => newPomo.type = string;
	const onSetGoal = (string: string) => newPomo.goal = string;
	const onTaskChanged = (string: string) => newPomo.task = string;
	const onMotivationChanged = (string: string) => newPomo.motivation = string;
	const onRewardChanged = (string: string) => newPomo.nextReward = string;
	const onSubtasksChanged = (subtasks: string[]) => newPomo.subtasks = subtasks;

	return <> <div className="creator"> 
		<div className="creator-content">
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				
			{/* Left */}
			<StagesCleared.Provider value={{ stages: stagesCleared, setStages: setStagesCleared }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
					{canEnterStage(Stages.TYPE) && <TypeStage info={info} stageAt={stageAt} onSetGoal={ onSetGoal } onSetType={ onSetType }/>}
					{canEnterStage(Stages.TASK) && <TaskStage info={info} stageAt={stageAt} onTaskChanged={ onTaskChanged } onMotivationChanged={ onMotivationChanged }/>}
					{canEnterStage(Stages.FIRST_REWARD) && <SelectFirstRewardStage info={info} stageAt={stageAt} onRewardChanged={onRewardChanged}/>}
				</div>
				{/* Right */}
				<div>
					{canEnterStage(Stages.SUBTASKS) && <SubtaskList info={info} stageAt={stageAt} onSubtasksChanged={ (change) => onSubtasksChanged(change) } />}
				</div>
			</StagesCleared.Provider>
			</div>
		</div>
		<div style={{ display: 'flex', padding: '10px', gap: '8px'}} >
			<button disabled={ isStartButtonDisabled() } onClick={() => info ? savePomodoro() : createPomodoro()} >{info ? "Save" : "Create"} </button>
			<button className="reset-button" onClick={() => info ? cancelUpdate() : reset()} > {info ? "Cancel" : "Reset" } </button>
		</div>
	</div> </> 
}

export default CreatePomodoro;
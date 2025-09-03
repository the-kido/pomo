import { createContext, useEffect, useState } from "react";
import { getDefaultPomoTimer, NONE, PomoActivityType, PomodoroTimerInfo, SELECT_GOAL } from "/src/types/Pomodoro"
import { usePomodorosStore } from "../PomodoroList";
import { SelectFirstRewardStage, SetTimeStage, TaskStage, TypeStage } from "./Stages";
import { TestTing } from "/src/main/components/EditableList";
import { useUserSettingsStore } from "/src/main/states/userDataStates";

type StagesCompletedType = {
	updateStageCleared: (isCompleted: boolean, stage: Stages) => void
};

export const StagesCleared = createContext<StagesCompletedType | undefined>(undefined);

export enum Stages {
	TYPE, 
	TASK, 
	TIME, 
	FIRST_REWARD,
	SUBTASKS
}

function getStagesRequired() {
	const state = useUserSettingsStore.getState()
	let stagesRequired: Stages[] = []
	let stagesNotRequired: Stages[] = []
	
	if (state.enabledTaskType) stagesRequired.push(Stages.TYPE)
	else stagesNotRequired.push(Stages.TYPE)

	stagesRequired.push(Stages.TASK)

	if (state.enabledTaskRewards) stagesRequired.push(Stages.FIRST_REWARD)
	else stagesNotRequired.push(Stages.FIRST_REWARD)

	stagesRequired.push(Stages.TIME)
	stagesRequired.push(Stages.SUBTASKS)

	return {stagesRequired: stagesRequired, stagesNotRequired: stagesNotRequired}
}

function CreatePomodoro({ info, onSaved, resetFields } : { info? : PomodoroTimerInfo, onSaved?: (newPomo: PomodoroTimerInfo) => void, resetFields?: () => void }) {
	const stagesRequired = getStagesRequired().stagesRequired;
	
	const [stagesCleared, setStagesCleared] = useState<Stages[]>(info ? stagesRequired : []);
	const [furthestStageReached, setFurthestStageReached] = useState<Stages>(info ? Stages.SUBTASKS : stagesRequired[0]);
	const [newPomo, setNewPomo] = useState<PomodoroTimerInfo>(info ? {...info} : getDefaultPomoTimer());

	const addPomodoro = usePomodorosStore(store => store.addPomodoro)
	
	const createPomodoro = () => {
		addPomodoro(newPomo);
		resetFields();
	}

	const enabledTaskType = useUserSettingsStore(a => a.enabledTaskType)
	const enabledTaskRewards = useUserSettingsStore(a => a.enabledTaskRewards)
	useEffect(() => {
		setFurthestStageReached(info ? Stages.SUBTASKS : stagesRequired[0])
		setStagesCleared(info ? stagesRequired : [])
		
		// For the stages we don't have, we must 
		const notRequired = getStagesRequired().stagesNotRequired;

		if (notRequired.includes(Stages.TYPE))
		{
			setNewPomo(old => ({...old, type: PomoActivityType.UNKNOWN, goal: SELECT_GOAL}))
		}
		
		if (notRequired.includes(Stages.FIRST_REWARD))
		{
			setNewPomo(old => ({...old, nextReward: NONE}))
		}

	}, [enabledTaskType, enabledTaskRewards])
	
	useEffect(() => {
		// If no stages are complete, then the stage at is just the first required stage.
		// If 1 or more stages is complete, then the stage at is the stage *after* the completed stage.
		if (stagesCleared.length == 0) setFurthestStageReached(stagesRequired[0]);
		else {
			let largest = stagesCleared[0];
			stagesCleared.forEach(stage => {
				largest = Math.max(largest, stage);
			});
			let newIndex = Math.min(stagesRequired.indexOf(largest) + 1, stagesRequired.length - 1);
			setFurthestStageReached(stagesRequired[newIndex]);
		}
	}, [stagesCleared, furthestStageReached])
	
	function temp(isCompleted: boolean, stage: Stages) {
		if (stage <= furthestStageReached && isCompleted && !stagesCleared.includes(stage)) { 
			setStagesCleared([...stagesCleared, stage]) 
		} else if (!isCompleted && stagesCleared.includes(stage)) {
			setStagesCleared(stagesCleared.filter( (stageCleared) => stageCleared != stage ) )
		}
	}
	
	const isStartButtonDisabled = () => 
		!stagesRequired.every(required => stagesCleared.includes(required));

	const canEnterStage = (stage: Stages) => 
		stagesRequired.includes(stage) && furthestStageReached >= stage;

	const savePomodoro = () =>{ console.log(newPomo); onSaved(newPomo);}
	const cancelUpdate = () => onSaved(info);

	return <div className="creator"> 
		<div className="creator-content">
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				
			{/* Left */}
			<StagesCleared.Provider value={{ updateStageCleared: temp }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
					{canEnterStage(Stages.TYPE) && <TypeStage 
						info={info} 
						onSetGoal={ newGoal => setNewPomo({ ...newPomo, goal: newGoal })} 
						onSetType={ newType => setNewPomo({ ...newPomo, type: newType })}
					/>}
					{canEnterStage(Stages.TASK) && <TaskStage 
						info={info} 
						onTaskChanged={ newTask => setNewPomo({ ...newPomo, task: newTask }) } 
						onMotivationChanged={ newMotive => setNewPomo({ ...newPomo, motivation: newMotive }) }
					/>}
					{canEnterStage(Stages.TIME) && <SetTimeStage 
						info={info} 
						// onRewardChanged={newReward => setNewPomo({ ...newPomo, nextReward: newReward })}
						onBreakTimeChanged={ newBreakTime => setNewPomo({...newPomo, breakTimeSeconds: newBreakTime }) }
						onWorkTimeChanged={ newWorkTime => setNewPomo({...newPomo, startTimeSeconds: newWorkTime }) }
					/>}
				</div>
				{/* Right */}
				<div>
					{canEnterStage(Stages.SUBTASKS) && <TestTing 
						info={info} 
						onSubtasksChanged = { newSubtasks => {newPomo.subtasks = newSubtasks;  console.log(newSubtasks)} }
						onIndiciesChanged = { newCompletedTaskIndicies => setNewPomo({ ...newPomo, subtasksCompletedIndicies: newCompletedTaskIndicies }) } 
					/>}
				</div>
			</StagesCleared.Provider>
			</div>
		</div>
		<div style={{ display: 'flex', padding: '10px', gap: '8px'}} >
			<button 
				disabled={ isStartButtonDisabled() } 
				onClick={() => info ? savePomodoro() : createPomodoro()} 
			> 
				{info ? "Save" : "Create"} 
			</button>
			<button 
				className="reset-button" 
				onClick={() => info ? cancelUpdate() : resetFields()} 
			>
				{info ? "Cancel" : "Reset" } 
			</button>
		</div>
	</div>
}

export default CreatePomodoro;
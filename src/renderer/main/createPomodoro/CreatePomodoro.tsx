import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_POMO_TIMER, PomodoroTimerInfo } from "/src/types/Pomodoro"
import { usePomodorosStore } from "../PomodoroList";
import { AppContext } from "../../App";
import SubtaskList, { SelectFirstRewardStage, TaskStage, TypeStage } from "./SubtaskList";

type StagesCompletedType = {
	updateStageCleared: (isCompleted: boolean, stage: Stages) => void
};

export const StagesCleared = createContext<StagesCompletedType | undefined>(undefined);

export enum Stages {
	TYPE, 
	TASK, 
	FIRST_REWARD, 
	SUBTASKS
}

function CreatePomodoro({ info, onSaved, resetFields } : { info? : PomodoroTimerInfo, onSaved?: (newPomo: PomodoroTimerInfo) => void, resetFields?: () => void }) {
	const stagesRequired = [ Stages.TYPE, Stages.TASK, Stages.FIRST_REWARD, Stages.SUBTASKS ];
	
	const [stagesCleared, setStagesCleared] = useState<Stages[]>(info ? stagesRequired : []);
	const [furthestStageReached, setFurthestStageReached] = useState<Stages>(info ? Stages.SUBTASKS : stagesRequired[0]);
	const [newPomo, setNewPomo] = useState<PomodoroTimerInfo>(info ? {...info} : DEFAULT_POMO_TIMER);

	const addPomodoro = usePomodorosStore(store => store.addPomodoro)
	
	const appContext = useContext<AppContext>(AppContext);

	const createPomodoro = () => {
		addPomodoro(newPomo);
		resetFields();
		appContext.saveData();
	}
	
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
			setFurthestStageReached(newIndex);
		}

	}, [stagesCleared, furthestStageReached])
	
	function temp(isCompleted: boolean, stage: Stages) {
		if (stage <= furthestStageReached && isCompleted && !stagesCleared.includes(stage)) { 
			setStagesCleared([...stagesCleared, stage]) 
		} else if (!isCompleted && stagesCleared.includes(stage)) {
			setStagesCleared(stagesCleared.filter( (stageCleared) => stageCleared != stage ) )
		}
	}
	
	const isStartButtonDisabled = () => !stagesRequired.every(required => stagesCleared.includes(required));
	const canEnterStage = (stage: Stages) => stagesRequired.includes(stage) && furthestStageReached >= stage;

	const savePomodoro = () => onSaved(newPomo);
	const cancelUpdate = () => onSaved(info);

	return <> <div className="creator"> 
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
					{canEnterStage(Stages.FIRST_REWARD) && <SelectFirstRewardStage 
						info={info} 
						onRewardChanged={newReward => setNewPomo({ ...newPomo, nextReward: newReward })}
					/>}
				</div>
				{/* Right */}
				<div>
					{canEnterStage(Stages.SUBTASKS) && <SubtaskList 
            info={info} 
            onSubtasksChanged = { newSubtasks => setNewPomo({ ...newPomo, subtasks: newSubtasks }) }
            onIndiciesChanged = { newCompletedTaskIndicies => setNewPomo({ ...newPomo, subtasksCompletedIndicies: newCompletedTaskIndicies }) } 
          />}
				</div>
			</StagesCleared.Provider>
			</div>
		</div>
		<div style={{ display: 'flex', padding: '10px', gap: '8px'}} >
			<button disabled={ isStartButtonDisabled() } onClick={() => info ? savePomodoro() : createPomodoro()} >{info ? "Save" : "Create"} </button>
			<button className="reset-button" onClick={() => info ? cancelUpdate() : resetFields()} > {info ? "Cancel" : "Reset" } </button>
		</div>
	</div> </> 
}

export default CreatePomodoro;
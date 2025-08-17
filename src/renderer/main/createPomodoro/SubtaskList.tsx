import { useContext, useEffect, useRef, useState } from "react";
import { Stages, StagesCleared } from "./CreatePomodoro";
import { useGoalStore, useRewardsStore } from "../../../main/states/userDataStates"
import { PomoActivityType, PomodoroTimerInfo, PomoActivityTypeDisplay } from "/src/types/Pomodoro";

const NONE: string = "None"
const PLEASE_SELECT: string = "Please Select"


export function TypeStage({ info, onSetType, onSetGoal } : { info? : PomodoroTimerInfo, onSetType: (type: PomoActivityType) => void, onSetGoal: (goal: string) => void }) {
  const [type, setType] = useState<PomoActivityType>(info ? info.type : PomoActivityType.UNKNOWN);
  const [goal, setGoal] = useState<string>(info ? info.goal : PLEASE_SELECT);
  const goals = useGoalStore((state) => state.goals);

  const stagesClearedContext = useContext(StagesCleared);
  
  useEffect(() => {
    const isCompleted = type == PomoActivityType.CHILL || type == PomoActivityType.ACTIVE && goal != PLEASE_SELECT;
    stagesClearedContext.updateStageCleared(isCompleted, Stages.TYPE);
  }, [type, goal])

  return <>
    {/* Temporary; use "slider" selection instead */}
    <select value={type} onChange={e => { setType(e.target.value as unknown as PomoActivityType); onSetType(e.target.value as unknown as PomoActivityType) }}>
      <option value="unknown">Select</option>
      <option className="divider-option" disabled>──────────</option>
      <option value={PomoActivityType.ACTIVE}>{PomoActivityTypeDisplay[PomoActivityType.ACTIVE]}</option>
      <option value={PomoActivityType.CHILL}>{PomoActivityTypeDisplay[PomoActivityType.CHILL]}</option>
    </select>
    { type == PomoActivityType.ACTIVE && <select value={goal} onChange={e => { setGoal(e.target.value); onSetGoal(e.target.value) }}>
      <option value={PLEASE_SELECT}>{PLEASE_SELECT}</option>
      <option className="divider-option" disabled>──────────</option>
      <option value={NONE} key={-1}>{NONE}</option>
      {goals.map((goal, i) => <option value={goal} key={i}> {goal} </option>)}
    </select> }
  </>
}

export function TaskStage({ info, onTaskChanged, onMotivationChanged} : { info? : PomodoroTimerInfo, onTaskChanged: (str: string) => void, onMotivationChanged: (str: string) => void }) {
  const [task, setTask] = useState<string>(info ? info.task : '');
  const [motivation, setMotivation] = useState<string>(info ? info.motivation : '');

  const stagesCompletedContext = useContext(StagesCleared)

  useEffect(() => {
    const isCompleted = task != '' && motivation != '';
    stagesCompletedContext.updateStageCleared(isCompleted, Stages.TASK);
  }, [task, motivation])

  return <div className="section">
    <p style={{margin: '0px'}}>
      I will <input 
        type="text" 
        className="inline-input" 
        defaultValue={task} 
        onChange={(e) => { 
          setTask(e.target.value); 
          onTaskChanged(e.target.value) 
        }}> 
      </input>
      <br></br>
      in order to <input 
        type="text" 
        className="inline-input" 
        defaultValue={motivation} 
        onChange={(e) => { 
          setMotivation(e.target.value); 
          onMotivationChanged(e.target.value) 
        }}>
      </input>
    </p>
  </div>
}

export function SelectFirstRewardStage(props: { info? : PomodoroTimerInfo, onRewardChanged: (str: string) => void }) {
  const [reward, setReward] = useState<string>(props.info ? props.info.nextReward : PLEASE_SELECT);
  const rewards = useRewardsStore((state) => state.rewards);

  const stagesCompletedContext = useContext(StagesCleared)
  
  /* TODO: Change time if wanted.
  const breakTime = usePomodoroTimerStore((store) => store.breakTime);
  const longBreakTime = usePomodoroTimerStore((store) => store.longBreakTime);
  */

  useEffect( () => {
    const isCompleted = reward != PLEASE_SELECT;
    stagesCompletedContext.updateStageCleared(isCompleted, Stages.FIRST_REWARD);
  }, [reward])

  return <div className="section">
    <h3> Initial things: </h3>
    <p> Reward:  
    <select className="inline-input" defaultValue={props.info ? reward : PLEASE_SELECT} onChange={(e) => { setReward(e.target.value); props.onRewardChanged(e.target.value) }}> 
      <option value={PLEASE_SELECT}>{PLEASE_SELECT}</option>
      <option className="divider-option" disabled>──────────</option>
      <option value={NONE} key={-1}>{NONE}</option>
      {rewards.map( (reward, i) => <option value={reward} key={i}> {reward} </option> ) }
    </select>
    </p>
  </div>
}



//#region Subtask Stage

export default function SubtaskList({info, onSubtasksChanged, onIndiciesChanged} : {info? : PomodoroTimerInfo, onSubtasksChanged: (subtasks: string[]) => void, onIndiciesChanged: (subtasks: number[]) => void} ) {
	const listRef = useRef<HTMLUListElement>(null);
	const [subtasks, setSubtasks] = useState<string[]>(info ? info.subtasks : []);
	const [completedIndicies, setCompletedIndicies] = useState<number[]>(info ? info.subtasksCompletedIndicies : []);
	
	const stagesCompletedContext = useContext(StagesCleared);
	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
		stagesCompletedContext.updateStageCleared(true, Stages.SUBTASKS);
	}, [subtasks]);

	return <ul ref={listRef} className="subtasks">
    {subtasks.map((task, index) => (
      <Subtask 
        key={index} 
        subtask={task} 
        completed={completedIndicies.includes(index)}
        index={index} 
        onRemove={() => {
          // Deal with the completed subtask indicies (the one we deleted should go bye bye. The indicides larger than it decrement)
          console.log("Before", completedIndicies)
          const newIndicies = completedIndicies
            .filter(value => value !== index)
            .map(value => value > index ? value - 1 : value);
          console.log("After", newIndicies)
          
          setCompletedIndicies(newIndicies);
          onIndiciesChanged(newIndicies)
          
          // Update the subtasks
          const newSubtasks = subtasks.filter((_, i) => i != index);
          setSubtasks(newSubtasks);
          onSubtasksChanged(newSubtasks);
        }}
      />
    ))}
    <AddSubtask subtasks={subtasks} setSubtasks={(newSubtasks) => { setSubtasks(newSubtasks); onSubtasksChanged(newSubtasks) }} />
  </ul>
}

function Subtask({subtask, completed, index, onRemove} : {subtask: string, completed: boolean, index: number, onRemove: () => void}) {
    return <div className="subtask">
        <div>
            <span style={{fontWeight: '400', marginRight: '10px'}}>
        {`${index + 1}.`}
      </span>
      <span style={{textDecoration: completed ? 'line-through' : 'none'}} >
        {subtask}
      </span>
        </div> 
        <button className="delete-button" onClick={onRemove} >
            <span className="delete-button-x">✖</span>
        </button>
    </div>
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

//#endregion
import { useContext, useEffect, useState } from "react";
import { Stages, StagesCleared } from "./CreatePomodoro";
import { useGoalStore, useRewardsStore } from "../../../main/states/userDataStates"
import { PomoActivityType, PomodoroTimerInfo, PomoActivityTypeDisplay, SELECT_GOAL, SELECT_TYPE, NONE, SELECT_REWARD } from "/src/types/Pomodoro";


export interface SubtaskItem {
  id: string;
  text: string;
}

export function TypeStage({ info, onSetType, onSetGoal } : { info? : PomodoroTimerInfo, onSetType: (type: PomoActivityType) => void, onSetGoal: (goal: string) => void }) {
  const [type, setType] = useState<PomoActivityType>(info ? info.type : PomoActivityType.UNKNOWN);
  const [goal, setGoal] = useState<string>(info ? info.goal : SELECT_GOAL);
  const goals = useGoalStore((state) => state.goals);

  const stagesClearedContext = useContext(StagesCleared);
  
  useEffect(() => {
    const isCompleted = type == PomoActivityType.CHILL || type == PomoActivityType.ACTIVE && goal != SELECT_GOAL;
    stagesClearedContext.updateStageCleared(isCompleted, Stages.TYPE);
  }, [type, goal])

  return <>
    {/* Temporary; use "slider" selection instead */}
    <select value={type} onChange={e => { setType(e.target.value as unknown as PomoActivityType); onSetType(e.target.value as unknown as PomoActivityType) }}>
      <option value={PomoActivityType.UNKNOWN}>{SELECT_TYPE}</option>
      <option className="divider-option" disabled>──────────</option>
      <option value={PomoActivityType.ACTIVE}>{PomoActivityTypeDisplay[PomoActivityType.ACTIVE]}</option>
      <option value={PomoActivityType.CHILL}>{PomoActivityTypeDisplay[PomoActivityType.CHILL]}</option>
    </select>
    { type == PomoActivityType.ACTIVE && <select value={goal} onChange={e => { setGoal(e.target.value); onSetGoal(e.target.value) }}>
      <option value={SELECT_GOAL}>{SELECT_GOAL}</option>
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
      I will: <input 
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
  const [reward, setReward] = useState<string>(props.info ? props.info.nextReward : SELECT_REWARD);
  const rewards = useRewardsStore((state) => state.rewards);

  const stagesCompletedContext = useContext(StagesCleared)
  
  /* TODO: Change time if wanted.
  const breakTime = usePomodoroTimerStore((store) => store.breakTime);
  const longBreakTime = usePomodoroTimerStore((store) => store.longBreakTime);
  */

  useEffect( () => {
    const isCompleted = reward != SELECT_REWARD;
    stagesCompletedContext.updateStageCleared(isCompleted, Stages.FIRST_REWARD);
  }, [reward])

  return <div className="section">
    <h3> Initial things: </h3>
    <p> Reward:  
    <select className="inline-input" defaultValue={props.info ? reward : SELECT_REWARD} onChange={(e) => { setReward(e.target.value); props.onRewardChanged(e.target.value) }}> 
      <option value={SELECT_REWARD}>{SELECT_REWARD}</option>
      <option className="divider-option" disabled>──────────</option>
      <option value={NONE} key={-1}>{NONE}</option>
      {rewards.map( (reward, i) => <option value={reward} key={i}> {reward} </option> ) }
    </select>
    </p>
  </div>
}
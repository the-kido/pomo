import { useContext, useEffect, useState } from "react";
import { Stages, StagesCleared } from "./CreatePomodoro";
import { useGoalStore, useRewardsStore, useUserSettingsStore } from "../../../main/states/userDataStates"
import { PomoActivityType, PomodoroTimerInfo, PomoActivityTypeDisplay, SELECT_GOAL, SELECT_TYPE, NONE, SELECT_REWARD } from "/src/types/Pomodoro";
import { ChevronDown } from "lucide-react";


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
    const isCompleted = type == PomoActivityType.CHILL || type == PomoActivityType.ACTIVE;
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
    { <select value={goal} onChange={e => { setGoal(e.target.value); onSetGoal(e.target.value) }}>
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
  const enabledSpecifyMotive = useUserSettingsStore(state => state.enabledSpecifyMotive);

  const stagesCompletedContext = useContext(StagesCleared)

  useEffect(() => {
    const isCompleted = task != '' && (!enabledSpecifyMotive || motivation != '');
    stagesCompletedContext.updateStageCleared(isCompleted, Stages.TASK);
  }, [task, motivation])

  return <div className="section">
    <h3>Task</h3>
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
    </p>  
    {enabledSpecifyMotive && <p style={{margin: '0px'}}>
      in order to <input 
        type="text" 
        className="inline-input" 
        defaultValue={motivation} 
        onChange={(e) => { 
          setMotivation(e.target.value); 
          onMotivationChanged(e.target.value) 
        }}>
      </input>
    </p>}
  </div>
}

export function SetTimeStage(props: {info? : PomodoroTimerInfo, onWorkTimeChanged: (str: number) => void, onBreakTimeChanged: (str: number) => void }) {
  const [workTime, setWorkTime] = useState<number>(props.info?.startTimeSeconds ?? 25 * 60);
  const [breakTime, setBreakTime] = useState<number>(props.info?.breakTimeSeconds ?? 5 * 60);

  const stagesCompletedContext = useContext(StagesCleared);

  useEffect(() => {
    const isCompleted = workTime > 0 && breakTime > 0;
    stagesCompletedContext.updateStageCleared(isCompleted, Stages.TIME);
  }, [workTime, breakTime]);

  return (
    <div className="section">
      <h3>Set Times</h3>
      <label>
        Work Time (minutes):{" "}
        <input
          type="number"
          min={1}
          value={workTime / 60}
          onChange={e => {
            const newValue = Number(e.target.value);
            setWorkTime(newValue * 60);
            props.onWorkTimeChanged(newValue * 60);
          }}
          className="inline-input"
        />
      </label>
      <br />
      <label>
        Break Time (minutes):{" "}
        <input
          type="number"
          min={1}
          value={breakTime / 60}
          onChange={e => {
            const newValue = Number(e.target.value);
            setBreakTime(newValue * 60)
            props.onBreakTimeChanged(newValue * 60) 
          }}
          className="inline-input"
        />
      </label>
      <br />
      {/* <label>
        Long Break Time (minutes):{" "}
        <input
          type="number"
          min={1}
          value={longBreakTime}
          onChange={e => setLongBreakTime(Number(e.target.value))}
          className="inline-input"
        />
      </label> */}
    </div>
  );
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

  const [showing, setShowing] = useState<boolean>( /* false */ true);

  return <div className="section">
    <div style={{display: 'flex', justifyContent: 'space-between'}} >
      <h3> Misc </h3> {/*<button onClick={() => setShowing(old => !old)} ><ChevronDown/> </button> */}
    </div>

    {showing && (
      <p> Reward:
        <select className="inline-input" defaultValue={props.info ? reward : SELECT_REWARD} onChange={(e) => { setReward(e.target.value); props.onRewardChanged(e.target.value) }}> 
          <option value={SELECT_REWARD}>{SELECT_REWARD}</option>
          <option className="divider-option" disabled>──────────</option>
          <option value={NONE} key={-1}>{NONE}</option>
          {rewards.map( (reward, i) => <option value={reward} key={i}> {reward} </option> ) }
        </select>
      </p>
    )}
  </div>
}
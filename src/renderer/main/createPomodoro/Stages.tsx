import { useContext, useEffect, useRef, useState } from "react";
import { Stages, StagesCleared } from "./CreatePomodoro";
import { useGoalStore, useRewardsStore } from "../../../main/states/userDataStates"
import { PomoActivityType, PomodoroTimerInfo, PomoActivityTypeDisplay } from "/src/types/Pomodoro";

const NONE: string = "None"
const PLEASE_SELECT: string = "Please Select"

interface SubtaskItem {
  id: string;
  text: string;
}

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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SubtaskList({info, onSubtasksChanged, onIndiciesChanged} : {info? : PomodoroTimerInfo, onSubtasksChanged: (subtasks: string[]) => void, onIndiciesChanged: (subtasks: number[]) => void} ) {
  const listRef = useRef<HTMLUListElement>(null);

  // Use the new SubtaskItem interface and generate initial IDs
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(
    info ? info.subtasks.map((text) => ({ id: crypto.randomUUID(), text })) : []
  );
  
  const [completedIndicies, setCompletedIndicies] = useState<number[]>(info ? (info.subtasksCompletedIndicies || []) : []);
  
  const stagesCompletedContext = useContext(StagesCleared);
  
  const onRemove = (idToRemove: string) => {
    const indexToRemove = subtasks.findIndex(task => task.id === idToRemove);
    if (indexToRemove === -1) return;

    // Deal with the completed subtask indicies
    const newIndicies = completedIndicies
      .filter(value => value !== indexToRemove)
      .map(value => value > indexToRemove ? value - 1 : value);
    
    setCompletedIndicies(newIndicies);
    onIndiciesChanged(newIndicies)
    
    // Update the subtasks
    const newSubtasks = subtasks.filter(task => task.id !== idToRemove);
    setSubtasks(newSubtasks);
    onSubtasksChanged(newSubtasks.map(task => task.text));
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

   const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      const oldIndex = subtasks.findIndex(task => task.id === active.id);
      const newIndex = subtasks.findIndex(task => task.id === over.id);

      // 1. Reorder the subtasks array
      const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex);
      setSubtasks(reorderedSubtasks);
      onSubtasksChanged(reorderedSubtasks.map(task => task.text));

      // 2. Remap the completed indicies to their new positions
      const remappedCompleted = completedIndicies.map(completedIndex => {
        if (completedIndex === oldIndex) return newIndex;
        if (completedIndex >= newIndex && completedIndex < oldIndex) return completedIndex + 1;
        if (completedIndex <= newIndex && completedIndex > oldIndex) return completedIndex - 1;
        return completedIndex;
      });

      setCompletedIndicies(remappedCompleted);
      onIndiciesChanged(remappedCompleted);
    }
  }

  useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
        stagesCompletedContext.updateStageCleared(true, Stages.SUBTASKS);
    }, [subtasks]);

    return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={subtasks.map(task => task.id)} // Use stable IDs
        strategy={verticalListSortingStrategy}
      >
        <ul ref={listRef} className="subtasks">
          {subtasks.map((task, index) => (
            <SortableSubtask 
              key={task.id} // Use stable ID for React key
              id={task.id} // Use stable ID for dnd-kit
              subtask={task.text} 
              completed={completedIndicies.includes(index)}
              index={index}
              onRemove={() => onRemove(task.id)}
            />
          ))}
          <AddSubtask 
            onAddSubtask={(text) => {
              const newSubtasks = [...subtasks, { id: crypto.randomUUID(), text }];
              setSubtasks(newSubtasks);
              onSubtasksChanged(newSubtasks.map(task => task.text));
            }} 
            nextIndex={subtasks.length + 1}
          />
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableSubtask(props: {id: string, subtask: string, completed: boolean, index: number, onRemove: () => void}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id}); // Use the stable ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Subtask {...props} dragAttributes={attributes} dragListeners={listeners} />
    </div>
  );
}

function Subtask({subtask, completed, index, onRemove, dragAttributes, dragListeners} : {subtask: string, completed: boolean, index: number, onRemove: () => void, dragAttributes: any, dragListeners: any}) {
  return <div className="subtask" {...dragAttributes} {...dragListeners}>
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

function AddSubtask({ onAddSubtask, nextIndex }: { onAddSubtask: (text: string) => void, nextIndex: number }) {
  const [newTask, setNewTask] = useState<string>('')
  const input = useRef<HTMLInputElement>(null);

  const onAddSubtaskPressed = () => {
    onAddSubtask(newTask);
    setNewTask('');
    input.current.value = '';
  }
  
  return <p className="subtask">
    { `${nextIndex}.` } 
    <input
      ref={input}
      type="text" 
      className="inline-input" 
      onChange={(e) => setNewTask(e.target.value)}
      placeholder="Add a subtask"
    />
    <button disabled={newTask === ''} onClick={onAddSubtaskPressed}>
      Add
    </button>
  </p>
}

//#endregion
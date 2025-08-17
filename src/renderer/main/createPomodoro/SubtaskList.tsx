import { useContext, useEffect, useRef, useState } from "react";
import { Stages, StagesCleared, updateStageCleared } from "./CreatePomodoro";
import { PomodoroTimerInfo } from "/src/types/Pomodoro";

export default function SubtaskList({info, stageAt, onSubtasksChanged, onIndiciesChanged} : {info? : PomodoroTimerInfo, stageAt: Stages, onSubtasksChanged: (subtasks: string[]) => void, onIndiciesChanged: (subtasks: number[]) => void} ) {
	const listRef = useRef<HTMLUListElement>(null);
	const [subtasks, setSubtasks] = useState<string[]>(info ? info.subtasks : []);
	const [completedIndicies, setCompletedIndicies] = useState<number[]>(info ? info.subtasksCompletedIndicies : []);
	
	const stagesCompletedContext = useContext(StagesCleared);
	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
		updateStageCleared(true, Stages.SUBTASKS, stagesCompletedContext, stageAt);
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
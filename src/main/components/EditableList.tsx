
//#region Subtask Stage
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS, subtract } from '@dnd-kit/utilities';
import { JSX, useContext, useEffect, useRef, useState } from 'react';
import { Stages, StagesCleared } from '/src/renderer/main/createPomodoro/CreatePomodoro';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';

interface SubtaskItem {
  id: string;
  text: string;
}

export function TestTing({onIndiciesChanged, info, onSubtasksChanged}: {onIndiciesChanged: (indicies: number[]) => void , info: PomodoroTimerInfo, onSubtasksChanged: (newSubtasks: string[]) => void}) {
  
    const [completedIndicies, setCompletedIndicies] = useState<number[]>(info ? (info.subtasksCompletedIndicies || []) : []);

    const stagesCompletedContext = useContext(StagesCleared);

    return <SubtaskList 
        info={info}
        onRemove={(subtasks, idToRemove: string) => {
            const indexToRemove = subtasks.findIndex(task => task.id === idToRemove);
            if (indexToRemove === -1) return;

            // Deal with the completed subtask indicies
            const newIndicies = completedIndicies
                .filter(value => value !== indexToRemove)
                .map(value => value > indexToRemove ? value - 1 : value);

            setCompletedIndicies(newIndicies);
            onIndiciesChanged(newIndicies);

            // Update the subtasks
        }}
        onHandleDragEnd={(event: DragEndEvent, oldIndex: number, newIndex: number) => {
       
            // 2. Remap the completed indicies to their new positions
            const remappedCompleted = completedIndicies.map(completedIndex => {
                if (completedIndex === oldIndex) return newIndex;
                if (completedIndex >= newIndex && completedIndex < oldIndex) return completedIndex + 1;
                if (completedIndex <= newIndex && completedIndex > oldIndex) return completedIndex - 1;
                return completedIndex;
            });

            setCompletedIndicies(remappedCompleted);
            onIndiciesChanged(remappedCompleted);
        
        }}
        onUpdate={() => stagesCompletedContext.updateStageCleared(true, Stages.SUBTASKS)}
        renderItem={(task: SubtaskItem, index: number, remove: (id: string) => void) => <SortableSubtask
            key={task.id} // Use stable ID for React key
            id={task.id} // Use stable ID for dnd-kit
            subtask={task.text}
            completed={completedIndicies.includes(index)}
            index={index}
            onRemove={() => remove(task.id)} />
        } 
        onSubtasksChanged={onSubtasksChanged}        
    ></SubtaskList>
}


export function SubtaskList({ renderItem, onHandleDragEnd, info, onSubtasksChanged, onRemove, onUpdate} : {renderItem: (task: SubtaskItem, index: number, remove: (id: string) => void ) => JSX.Element, onHandleDragEnd: (event: DragEndEvent, oldIndex: number, newIndex: number) => void, info? : PomodoroTimerInfo, onSubtasksChanged: (subtasks: string[]) => void, onRemove: (subtasks: SubtaskItem[], id: string) => void, onUpdate: () => void} ) {
  const listRef = useRef<HTMLUListElement>(null);

  // Use the new SubtaskItem interface and generate initial IDs
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(
    info ? info.subtasks.map((text) => ({ id: crypto.randomUUID(), text })) : []
  );
  
  
  const remove = (idToRemove: string) => {

    const newSubtasks = subtasks.filter(task => task.id !== idToRemove);
    setSubtasks(newSubtasks);
    onSubtasksChanged(newSubtasks.map(task => task.text));

    onRemove(subtasks, idToRemove)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = subtasks.findIndex(task => task.id === active.id);
        const newIndex = subtasks.findIndex(task => task.id === over.id);

        // 1. Reorder the subtasks array
        const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex);
        setSubtasks(reorderedSubtasks);
        onSubtasksChanged(reorderedSubtasks.map(task => task.text));

        onHandleDragEnd(event, oldIndex, newIndex)
    }
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
 
    useEffect(() => {
        console.log("brbrbr, ", subtasks)
        console.log("brbrbr, ", info)

        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
        onUpdate()
    }, [subtasks]);

    console.log(subtasks, "?")
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
            renderItem(task, index, remove)
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

export function SortableSubtask({id, subtask, completed, index, onRemove}: {id: string, subtask: string, completed: boolean, index: number, onRemove: () => void}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id}); // Use the stable ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Subtask subtask={subtask} onRemove={onRemove} completed={completed} index={index} dragAttributes={attributes} dragListeners={listeners}/>
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

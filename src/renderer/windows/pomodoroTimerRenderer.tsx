import '../../index.css';

import { createRoot } from 'react-dom/client';
import { JSX, useEffect, useRef, useState } from 'react';
import { PomoActivityTypeDisplay, PomodoroTimerInfo } from '/src/types/Pomodoro';
import Subtask from './pomodoro/Subtask';
import Timer from './pomodoro/Timer';
import { create } from 'zustand';
import Header from './pomodoro/Header';

const SUBTASK_ARRAY_WEIGHTS = [1, 0.5, 0.325];

interface UpdateDescription {
  updating: boolean,
  setDescription: () => void,
  finishSettingDescription: () => void,
}

const useUpdatingState = create<UpdateDescription>(set => ({
  updating: false,
  setDescription: () => set({ updating: true }),
  finishSettingDescription: () => set({ updating: false})
}))

function Pomodoro({ info }: { info?: PomodoroTimerInfo }) {

  const [completeTaskIndicies, setCompleteTaskIndicies] = useState<Array<number>>([]);
  const [pomosCompleted, setPomosCompleted] = useState<number>(info.completed);
  const discTextField = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.pomodoro.sendUpdate({...info, completed: pomosCompleted});
  }, [pomosCompleted])

  const setupSubtasks = (): {array: JSX.Element[], leftover: number} => {
    
    let out: JSX.Element[] = [];
    
    const makeSubtask = ( subtaskIndex: number, completed: boolean ) => <Subtask 
      setTaskComplete={() => { 
        completed = true; 
        setCompleteTaskIndicies([...completeTaskIndicies, subtaskIndex]) 
      }} 
      completed={completed} 
      taskDescription={info.subtasks[subtaskIndex]} 
      percent={SUBTASK_ARRAY_WEIGHTS[out.length]} 
      key={subtaskIndex}
    />
    
    // first, populate with tasks that "aren't" complete
    for (let i = 0; i < info.subtasks.length && out.length < 3; i++) {
      if (completeTaskIndicies.includes(i)) continue;
      
      out.push(makeSubtask(i, false));
    }
    
    // Then populate with tasks that "are" complete.
    // This comes w/ the bonus of adding the items depending on which was completed first!
    for (let i = 0; i < completeTaskIndicies.length && out.length < 3; i++) {
      const a = completeTaskIndicies[i];
      out.push(makeSubtask(a, true));
    }
    
    return {array: out, leftover: info.subtasks.length - out.length };
  }
  
 
  function onPomodoroClose() {
    window.pomodoro.attemptClose(info); 
  }
  
  function onDescriptionChangeCancel() {
    finishSettingDescription();
  }
  
  function onDescriptionChangeSaved() {
    info.task = discTextField.current.value;
    finishSettingDescription();

    window.pomodoro.sendUpdate({...info, task: discTextField.current.value});
  }
  
  var tasks = setupSubtasks();
  var progress = 1.0 * completeTaskIndicies.length / info.subtasks.length;
  
  const updating = useUpdatingState(state => state.updating);
  const setDescription = useUpdatingState(state => state.setDescription);
  const finishSettingDescription = useUpdatingState(state => state.finishSettingDescription);

  return <div className="pomo">
    <Header />
    <div className="main-info">
      {/* This is the first "square" w/ the main info */}
      <div className={"timer"}>
        <Timer 
          workTime={info.startTimeSeconds} 
          breakTime={info.breakTimeSeconds} 
          onClose={onPomodoroClose}
          pomosFinished={info.completed}
          onPomoFinished={() => setPomosCompleted(prev => prev + 1)} 
        />
      </div>
      {updating ? <textarea ref={discTextField} defaultValue={info.task}></textarea> : <h2 className='description' onClick={setDescription} > {info.task} </h2>}
      {updating ? <div style={{display: 'flex'}}>
          <input type='button' defaultValue={"Cancel"} onClick={onDescriptionChangeCancel}></input>
          <input type='button' defaultValue={"Finish"} onClick={onDescriptionChangeSaved}></input>
        </div> : <div className='misc-info'> 
          <div style={{display: 'flex'}}>
            <h4>{PomoActivityTypeDisplay[info.type]}</h4> 
            <h4>{info.goal}</h4> 
          </div>
          <h4>🍅 x{pomosCompleted}</h4> 
        </div>
      }
    </div>
      {info.subtasks.length > 0 && <>
      {/* For the "progress bar" */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ position: 'absolute', margin: '0px' }}> {completeTaskIndicies.length}/{info.subtasks.length} </h2>
        <progress style={{ width: '65%', margin: '10px', blockSize: '1.2em' }} id="file" value={progress} max="1"> 32% </progress>
      </div>
      {/* For the list of subtasks */}
      {tasks.array}
      {tasks.leftover > 0 && <p> {`. . . (${tasks.leftover} more)`}</p>}
    </>}
  </div>
}

function App() {
  const [timerInfo, setTimerInfo] = useState<PomodoroTimerInfo | 'Unset'>('Unset');

  useEffect(() => {
      window.pomodoro.onInit((receivedData) => {
          setTimerInfo(receivedData);
      });
  }, []);
  return timerInfo == 'Unset' ? <div> Loading... </div> : <Pomodoro info={timerInfo}/>
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
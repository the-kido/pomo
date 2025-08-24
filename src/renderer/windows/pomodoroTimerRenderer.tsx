import '../../../src/master.css';
import './timer.css'

import { createRoot } from 'react-dom/client';
import { JSX, useEffect, useRef, useState } from 'react';
import { DayWork, PomoActivityTypeDisplay, PomodoroTimerInfo } from '/src/types/Pomodoro';
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
  finishSettingDescription: () => set({ updating: false })
}))

function Pomodoro({ info }: { info?: PomodoroTimerInfo }) {
  const [subtasksCompletedIndicies, setSubtasksCompletedIndicies] = useState<number[]>(info.subtasksCompletedIndicies);
  const [pomosCompleted, setPomosCompleted] = useState<number>(info.completed);
  const discTextField = useRef<HTMLTextAreaElement>(null);

  // Required for if we're using the shrunk or not shrunk version of the UI
  const [isShrunk, setIsShrunk] = useState<boolean>(false);
  const pomoWindow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.pomodoro.sendPomodoroUpdate({ ...info, completed: pomosCompleted });
  }, [pomosCompleted])
  
  useEffect(() => {
 
  }, [history])
  
  const updatePomodorosCompleted = () => {
    window.pomodoro.incrementPomosDone();
    setPomosCompleted(prev => prev + 1);
  }

  useEffect(() => {
    window.pomodoro.sendPomodoroUpdate({ ...info, subtasksCompletedIndicies: subtasksCompletedIndicies });
  }, [subtasksCompletedIndicies])

  const setupSubtasks = (): { array: JSX.Element[], leftover: number } => {

    let out: JSX.Element[] = [];

    const makeSubtask = (subtaskIndex: number, completed: boolean) => (
      <Subtask
        setTaskComplete={() => {
          completed = true;
          setSubtasksCompletedIndicies([...subtasksCompletedIndicies, subtaskIndex])
        }}
        completed={completed}
        taskDescription={info.subtasks[subtaskIndex]}
        percent={SUBTASK_ARRAY_WEIGHTS[out.length]}
        key={subtaskIndex}
      /> 
    )

    // first, populate with tasks that "aren't" complete
    for (let i = 0; i < info.subtasks.length && out.length < 3; i++) {
      if (subtasksCompletedIndicies.includes(i)) continue;

      out.push(makeSubtask(i, false));
    }

    // Then populate with tasks that "are" complete.
    // This comes w/ the bonus of adding the items depending on which was completed first!
    for (let i = 0; i < subtasksCompletedIndicies.length && out.length < 3; i++) {
      const a = subtasksCompletedIndicies[i];
      out.push(makeSubtask(a, true));
    }

    return { array: out, leftover: info.subtasks.length - out.length };
  }


  function onPomodoroClose() {
    window.pomodoro.attemptClose(info);
  }

  function onToggleSize(newSize: boolean) {
    setIsShrunk(newSize);
  }

  useEffect(() => {
    // This runs after isShrunk changes and the DOM/layout is updated
    window.pomodoro.changeSize(pomoWindow.current.scrollWidth, pomoWindow.current.scrollHeight);
    // You can also measure the DOM here if needed
  }, [isShrunk]);

  function onDescriptionChangeCancel() {
    finishSettingDescription();
  }

  function onDescriptionChangeSaved() {
    info.task = discTextField.current.value;
    finishSettingDescription();

    window.pomodoro.sendPomodoroUpdate({ ...info, task: discTextField.current.value });
  }

  var tasks = setupSubtasks();
  var progress = 1.0 * subtasksCompletedIndicies.length / info.subtasks.length;

  const updating = useUpdatingState(state => state.updating);
  const setDescription = useUpdatingState(state => state.setDescription);
  const finishSettingDescription = useUpdatingState(state => state.finishSettingDescription);


  const subtaskProgressBarColor = `linear-gradient(-90deg,rgba(255, 255, 255, 0) ${(1 - progress) * 100}%,var(--subtask-progress-green) ${(1 - progress) * 100}%)`

  return <div ref={pomoWindow} className="pomo">
    <Header onClose={onPomodoroClose} isShrunk={isShrunk} toggleSize={onToggleSize} />
    <div className="main-info">
      {/* This is the first "square" w/ the main info */}
      <div className={"timer"}>
        <Timer
          workTime={/*info.startTimeSeconds*/ 5}
          breakTime={info.breakTimeSeconds}
          pomosFinished={info.completed}
          onPomoFinished={() => updatePomodorosCompleted() }
        />
      </div>
      {updating ? <textarea ref={discTextField} defaultValue={info.task}></textarea> : <h2 className='description' onClick={setDescription} > {info.task} </h2>}
      {updating ? <div style={{ display: 'flex' }}>
        <input type='button' defaultValue={"Cancel"} onClick={onDescriptionChangeCancel}></input>
        <input type='button' defaultValue={"Finish"} onClick={onDescriptionChangeSaved}></input>
      </div> : <div className='misc-info'>
        <div style={{ display: 'flex' }}>
          <h4 className='chip'>{PomoActivityTypeDisplay[info.type]}</h4>
          <h4 className='chip'>{info.goal}</h4>
        </div>
        <h4>🍅 x{pomosCompleted}</h4>
      </div>
      }
    </div>
    {info.subtasks.length > 0 && <>
      {/* For the "progress bar" */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
        <h2 className='progress-bar-text'>
          {`${subtasksCompletedIndicies.length}/${info.subtasks.length}`}
        </h2>
        <div className='subtask-progress-bar' style={{ background: subtaskProgressBarColor, height: '10px' }} ></div>
      </div>
      {/* For the list of subtasks */}
      {!isShrunk && <>
        {tasks.array}
        {tasks.leftover > 0 && <p> {`. . . (${tasks.leftover} more)`}</p>}
      </> }
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
  return timerInfo == 'Unset' ? <div> Loading... </div> : <Pomodoro info={timerInfo} />
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
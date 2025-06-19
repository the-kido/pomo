import { createRoot } from 'react-dom/client';

import { JSX, useEffect, useState } from 'react';
import { PomodoroRendererExports, PomodoroTimerInfo } from '/src/types/Pomodoro';
import Subtask from './pomodoro/Subtask';
import Timer from './pomodoro/Timer';

declare global {
  interface Window {
    pomodoro: PomodoroRendererExports
  }
}

const SUBTASK_ARRAY_WEIGHTS = [1, 0.5, 0.325];

function Pomodoro({ info }: { info?: PomodoroTimerInfo }) {

  const [completeTaskIndicies, setCompleteTaskIndicies] = useState<Array<number>>([]);

  useEffect( () => {
    window.pomodoro.sendUpdate(info);
  }, [completeTaskIndicies])

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
  
  function onClose() {
    window.pomodoro.attemptClose(info); 
  }

  var tasks = setupSubtasks();
  var progress = 1.0 * completeTaskIndicies.length / info.subtasks.length;

return <div className="pomo">
    <div className="main-info">
      {/* This is the first "square" w/ the main info */}
        <div className={"timer"}>
          {/* #TODO What the FRICK is that number and why is it pivotal to getting the effect I want!? */}
          <Timer workTime={info.startTimeSeconds} breakTime={info.breakTimeSeconds} onClose={onClose}/>
        </div>

        <h2 style={{textAlign:'center', margin: '10px' }}> {info.task} </h2>
    </div>
      {info.subtasks.length > 0 && <>
      {/* For the "progress bar" */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ position: 'absolute', margin: '0px' }} > {completeTaskIndicies.length}/{info.subtasks.length} </h2>
        <progress style={{ width: '65%', margin: '10px', blockSize: '1.2em' }} id="file" value={progress} max="1"> 32% </progress>
      </div>
      {/* For the list of subtasks */}
      {tasks.array}
      {tasks.leftover > 0 && <p> {`. . . (${tasks.leftover} more)`}</p>}
      
    </>}
  </div>
}

function App() {
  const [timerInfo, setTimerInfo] = useState<PomodoroTimerInfo|'Unset'>(
    // /*
    {
      received: false,
      startTimeSeconds: 2,
      breakTimeSeconds: 4,
      task: 'Finish Assigment 4 Due In Two Weeks',
      subtasks: [
        "Do small thing", 
        "And other thing",
        "But this is the last thing!",
        "NONO BUT THIS THING FOR REAL IM NOT JOKING!!",
      ],
      type: 'chill',
      motivation: 'a',
      nextReward: 'b'
    }
    // */
    // 'Unset'
  );

  useEffect(() => {
      window.pomodoro.onInit((receivedData) => {
          // TODO: Send response to pomodoro to ensure info send is valid ?
          // okay wait no, i just need to ensure the pomodoro sends valid info
          setTimerInfo(receivedData);
      });
  });
  return timerInfo == 'Unset' ? <div> Loading... </div> : <Pomodoro info={timerInfo}/>
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App/>);
}
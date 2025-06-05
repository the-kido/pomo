import { createRoot } from 'react-dom/client';

console.log("hope this works lol!")

import { CSSProperties, JSX, useEffect, useRef, useState } from 'react';
import { PomodoroRendererExports, PomodoroTimerInfo } from '../../types/Pomodoro';

declare global {
  interface Window {
    pomodoro: PomodoroRendererExports
  }
}

const POMO: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  flexWrap: 'wrap',
  width: '100%'
}

const MAIN_INFO: CSSProperties = {
  borderStyle: 'dashed',
  borderWidth: 'medium',
  borderColor: 'red',
  // TODO what does this do?
  boxSizing: 'border-box',
  width: '100%',
  
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  flexWrap: 'wrap',
}

const TIMER: CSSProperties = {
  display: 'flex', 
  alignItems: 'center',

  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
}

interface SubtaskProps {
  taskDescription: string, percent: number, completed?: boolean, setTaskComplete: () => void
}

function Subtask(props: SubtaskProps) {
  const { taskDescription, percent, completed, setTaskComplete } = props;

  const BOX_STYLE: CSSProperties = {

    display: 'flex',
    flexDirection: 'row',
    gap: '10px',

    color: `rgb(0, 0, 0, ${percent})`,
    margin: '0px',
    paddingRight: '10px',
    paddingLeft: '10px',
    marginBottom: '10px',

    borderStyle: 'dashed',
    borderWidth: 'medium',
    borderColor: !completed ? `rgb(255, 0, 0, ${percent})` : `rgb(0, 255, 255, ${percent})`,
    // TODO what does this do?
    boxSizing: 'border-box',
    // Border things
  }

  const TEXT_STYLE: CSSProperties = {
    margin: '0px'
  }

  return <div style={BOX_STYLE}>
    <h3 style={TEXT_STYLE}> {taskDescription} </h3>
    <input type='checkbox' defaultChecked={completed} onClick={setTaskComplete} disabled={completed}></input>
  </div>
}

interface TimerState {
  tick: () => void,
  onSwitchPressed: () => void,
  onPausedPressed: () => void,
  init: (stateComingFrom?: TimerStates) => void,
}

enum TimerStates {
  JustOpened,
  WorkTimer,
  WorkPaused,
  WorkFinished,
  BreakTimer,
  BreakFinished,
}

function Timer({workTime, breakTime, onClose} : {workTime: number, breakTime: number, onClose : () => void} ) {

  const [currentState, setCurrentState] = useState<TimerStates>(TimerStates.JustOpened);

  const setAndInitState = (goToState: TimerStates, stateComingFrom?: TimerStates) => {
    setCurrentState(goToState);
    states[goToState].init(stateComingFrom)
  }
  
  const stringify = (secs: number, mins: number) =>  `${mins}:${secs <= 9 ? "0" : ""}${secs}`;
  
  const currentTimeAtPause = useRef<number>(0);
  const timeStartedMS = useRef<number>(Date.now());
  const timePaused = useRef<number>(0);
  const [timeText, setTimeText] = useState<string>(stringify(Math.floor(workTime % 60), Math.floor(workTime / 60)))
  const [percentLeft, setPercentLeft] = useState<number>(1)

  const states: Record<TimerStates, TimerState> = {
    [TimerStates.JustOpened]: {
      tick: () => null,
      onSwitchPressed: () => null,
      onPausedPressed: () => {
        setAndInitState(TimerStates.WorkTimer)
      },
      init: () => null,
    },
    [TimerStates.WorkTimer]: {
      tick: () => {
        decreaseTimer(TimerStates.WorkTimer, TimerStates.WorkFinished)
      },
      onSwitchPressed: () => null,
      onPausedPressed: () => {
        setAndInitState(TimerStates.WorkPaused)
      },
      init: (comingFrom: TimerStates ) => {
        // if we're coming from a pause, then we do NOT reset the timer
        if (comingFrom != TimerStates.WorkPaused) {
          timeStartedMS.current = Date.now();
          timePaused.current = 0;
        }
      },
    },
    [TimerStates.WorkPaused]: {
      tick: () => null,
      onSwitchPressed: () => null,
      onPausedPressed: () => {
        timePaused.current += Date.now() - currentTimeAtPause.current;
        setAndInitState(TimerStates.WorkTimer, TimerStates.WorkPaused)
      },
      init: () => {
        currentTimeAtPause.current = Date.now();
      },
    },
    [TimerStates.WorkFinished]: {
      tick: () => null,
      onSwitchPressed: () => {
        setAndInitState(TimerStates.BreakTimer)
      },
      onPausedPressed: () => null,
      init: () => null,
    },
    [TimerStates.BreakTimer]: {
      tick: () => {
        decreaseTimer(TimerStates.BreakTimer, TimerStates.BreakFinished)
      },
      onSwitchPressed: () => null,
      onPausedPressed: () => null,
      init: () => {
        timeStartedMS.current = Date.now();
        timePaused.current = 0;
      },
    },
    [TimerStates.BreakFinished]: {
      tick: () => null,
      onSwitchPressed: () => {
        setAndInitState(TimerStates.WorkTimer)
      },
      onPausedPressed: () => null,
      init: () => null,
    },
  } 

  useEffect(() => {
    setInterval(() => {
      setCurrentState( currentState => {
        states[currentState].tick();
        return currentState;
      })
    }, 250);
  }, []);

  const decreaseTimer = (currentState: TimerStates, switchTo: TimerStates) => {
    if (isPaused(currentState)) return

    const finalTimeMS = currentState == TimerStates.BreakTimer ? getFinalBreakTime() : getFinalWorkTime()
    if (finalTimeMS <= 0) {
      setCurrentState(switchTo);
      setPercentLeft(0)          
      setTimeText('0:00');
      return
    }

    const mins = Math.floor(Math.ceil(finalTimeMS / 1000) / 60)
    const secs = Math.ceil(finalTimeMS / 1000 - mins * 60);

    setPercentLeft((finalTimeMS / 1000) / (currentState == TimerStates.BreakTimer ? breakTime : workTime));
    setTimeText(stringify(secs, mins));
  }
  
  const onPausePressed = () => states[currentState].onPausedPressed()
  const onSwitchPressed = () => states[currentState].onSwitchPressed()

  // two functions to get the final "times" from both of work and break time
  const getFinalWorkTime = () => workTime * 1000 - (Date.now() - timeStartedMS.current) + timePaused.current;
  const getFinalBreakTime = () => breakTime * 1000 - (Date.now() - timeStartedMS.current)
  
  const isPaused = (currentState: TimerStates) => currentState == TimerStates.WorkPaused || currentState == TimerStates.JustOpened;
  const isPauseButtonEnabled = () => currentState == TimerStates.WorkPaused || currentState == TimerStates.WorkTimer || currentState == TimerStates.JustOpened;
  const isSwitchButtonEnabled = () => currentState == TimerStates.WorkFinished || currentState == TimerStates.BreakFinished || currentState == TimerStates.BreakTimer;

  return <>
    <div style={{background: `linear-gradient(-90deg,rgb(206, 202, 202) ${percentLeft * 100}%,rgb(243, 73, 73) ${percentLeft * 100}%)`, flex: 1, display: 'flex', justifyContent: 'center'}}>
      <h1 style={{ fontSize: '50px', margin: '0px' }} > {timeText} </h1>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', margin: '10px',  gap: '10px' }} > 
      <button disabled={!isPauseButtonEnabled()} onClick={() => onPausePressed()} >{currentState == TimerStates.JustOpened ? "Start!" : (isPaused(currentState) ? "Unpause" : "Pause")}</button>
      <button disabled={!isSwitchButtonEnabled()} onClick={() => onSwitchPressed()} > {currentState == TimerStates.BreakTimer ? "Skip" : "Switch" } </button>
      <button onClick={() => onClose()} >Close</button>
    </div>
  </>
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
      setTaskComplete={() => { completed = true; setCompleteTaskIndicies([...completeTaskIndicies, subtaskIndex]);
        
      } } 
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

  return <div style={POMO}>
    <div style={MAIN_INFO}>
      {/* This is the first "square" w/ the main info */}
        <div style={TIMER}>
          {/* #TODO What the FRICK is that number and why is it pivotal to getting the effect I want!? */}
          <Timer workTime={info.startTimeSeconds} breakTime={info.breakTimeSeconds} onClose={onClose}/>
        </div>

        <h2 style={{textAlign:'center', margin: '10px' }}> {info.mainTask} </h2>
    </div>

    {info.subtasks.length > 0 && <>    
      {/* For the "progress bar" */}
      <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{position:'absolute', margin: '0px' }} >7/10</h2>
        <progress style={{ width:'65%', margin: '10px', blockSize: '1.2em' }} id="file" value="32" max="100"> 32% </progress>
      </div>
      {/* For the list of subtasks */}
      {
        tasks.array
      }
      {
        tasks.leftover > 0 && <p> {`. . . (${tasks.leftover} more)`}</p>
      }   
    </>}
  </div>
}

function App() {
  const [timerInfo, setTimerInfo] = useState<PomodoroTimerInfo|'Unset'>(
    /*
    {
      received: false,
      startTimeSeconds: 6,
      breakTimeSeconds: 1,
      mainTask: 'Finish Assigment 4 Due In Two Weeks',
      subtasks: [
        "Do small thing", 
        "And other thing",
        "But this is the last thing!",
        "NONO BUT THIS THING FOR REAL IM NOT JOKING!!",
      ]
    }
    */
    'Unset'
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
import { useEffect, useRef, useState } from "react";
import Popup, { useCheckInPopupStore, usePausePopupStore } from "./Popup";
import { timeToWords } from "/src/main/utils/utils";

interface TimerState {
  tick: () => void,
  onSwitchPressed: () => void,
  onPausedPressed: () => void,
  init: (stateComingFrom?: TimerStates) => void,
}

enum TimerStates { JustOpened, WorkTimer, WorkPaused, WorkFinished, BreakTimer, BreakFinished }

export default function Timer({workTime, breakTime, pomosFinished, onPomoFinished} : {workTime: number, breakTime: number, pomosFinished: number, onPomoFinished: () => void} ) {

  const [currentState, setCurrentState] = useState<TimerStates>(TimerStates.JustOpened);

  const setAndInitState = (goToState: TimerStates, stateComingFrom?: TimerStates) => {
    setCurrentState(goToState);
    states[goToState].init(stateComingFrom)
  }
  
  const stringify = (secs: number, mins: number) => `${mins}:${secs <= 9 ? "0" : ""}${secs}`;
  
  const currentTimeAtPause = useRef<number>(0);
  const timeStartedMS = useRef<number>(Date.now());
  const timePaused = useRef<number>(0);
  const [timePausedText, setTimePausedText] = useState<string>("");
  const [timeText, setTimeText] = useState<string>(stringify(Math.floor(workTime % 60), Math.floor(workTime / 60)))
  const [percentLeft, setPercentLeft] = useState<number>(1)
  
  const openPausePopup = usePausePopupStore(state => state.openPopup);
  const closePausePopup = usePausePopupStore(state => state.closePopup);
  
  const showCheckIn = useCheckInPopupStore(state => state.openPopup);
  const hideCheckIn = useCheckInPopupStore(state => state.closePopup);

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
      tick: () => {       
        var pausedMins = Math.floor(Math.ceil((Date.now() - currentTimeAtPause.current) / 1000) / 60);
        var pausedSecs = Math.floor((Date.now() - currentTimeAtPause.current) / 1000 - pausedMins * 60);
        setTimePausedText(timeToWords(pausedMins, pausedSecs));
      },
      onSwitchPressed: () => null,
      onPausedPressed: () => {
        closePausePopup();
        timePaused.current += Date.now() - currentTimeAtPause.current;
        setAndInitState(TimerStates.WorkTimer, TimerStates.WorkPaused)
        setTimePausedText("0 seconds");
      },
      init: () => {
        openPausePopup();
        currentTimeAtPause.current = Date.now();
      },
    },
    [TimerStates.WorkFinished]: {
      tick: () => null,
      onSwitchPressed: () => {
        onPomoFinished();
        setAndInitState(TimerStates.BreakTimer)
      },
      onPausedPressed: () => null,
      init: () => {},
    },
    [TimerStates.BreakTimer]: {
      tick: () => {
        decreaseTimer(TimerStates.BreakTimer, TimerStates.BreakFinished)
      },
      onSwitchPressed: () => {
        // A very hacky solution. May change if required in the future.
        timeStartedMS.current = Date.now() - workTime * 1000;
        decreaseTimer(TimerStates.BreakTimer, TimerStates.BreakFinished);
      },
      onPausedPressed: () => null,
      init: () => {
        showCheckIn();
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
    if (isPaused(currentState)) return;

    const finalTimeMS = currentState == TimerStates.BreakTimer ? getFinalBreakTime() : getFinalWorkTime();
    if (finalTimeMS <= 0) {
      setAndInitState(switchTo);
      setPercentLeft(0);          
      setTimeText('0:00');
      return;
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

  const progressBarColor = `linear-gradient(-90deg, var(--timer-progress-left) ${percentLeft * 100}%,var(--timer-progress-done) ${percentLeft * 100}%)`
  
  return <>
    {/* Pop-up related stuff */}
    <Popup usePopupStore={usePausePopupStore}>
      <div className="pause-popup">
        <h2> Timer paused for</h2>
        <h3> {timePausedText}</h3>
        <textarea id="hint text" placeholder="Optional: why did you pause?" cols={20} rows={5} style={{ resize: 'none' }}></textarea>
      </div>
    </Popup>
    <Popup usePopupStore={useCheckInPopupStore}>
      <div className="break-popup">
        <h3>You're on break!</h3>
        <textarea id="hint text" placeholder="How did that session go?" cols={20} rows={5} style={{ resize: 'none' }}></textarea>
        <button onClick={hideCheckIn}>Dismiss</button>
      </div>
    </Popup>
    {/* The actual content of the timer */}
    <div className="progress-bar" style={{ background: progressBarColor, flex: 1, display: 'flex', justifyContent: 'center' }}>
      <h1 className="timer-text"> {timeText} </h1>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '10px', gap: '10px' }}>
        <button
          disabled={!isPauseButtonEnabled()}
          onClick={() => onPausePressed()}
          className="test"
          style={{ width: 70, zIndex: isPaused(currentState) ? 1000 : 'auto' }}
        >
          {currentState == TimerStates.JustOpened ? "Start!" : (isPaused(currentState) ? "Unpause" : "Pause")}
        </button>
        <button className="test" disabled={!isSwitchButtonEnabled()} onClick={() => onSwitchPressed()} > {currentState == TimerStates.BreakTimer ? "Skip" : "Switch"} </button>
      </div>
    </div>
  </>
}

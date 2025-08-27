import { memo, useEffect, useRef, useState } from "react";
import Popup, { usePausePopupStore } from "./Popup";
import { timeToWords } from "/src/main/utils/utils";
import { FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { create } from "zustand";


interface ShowSwitchPrompt {
  showing: boolean,
  message: string,
  hide: () => void,
  show: (message: string) => void,
  onSwitchMenu?: () => void, // <-- Add this
  setOnSwitchMenu: (cb: () => void) => void, // <-- Add setter
}

export const useSwitchStore = create<ShowSwitchPrompt>(set => ({
  showing: false,
  message: "Switch to break",
  show: (message: string) => set({ showing: true, message }),
  hide: () => set({ showing: false }),
  onSwitchMenu: undefined,
  setOnSwitchMenu: (cb: () => void) => set({ onSwitchMenu: cb }),
}));



interface TimerState {
  tick: () => void,
  onSwitchPressed: () => void,
  onPausedPressed: () => void,
  init: (stateComingFrom?: TimerStates) => void,
}

enum TimerStates { JustOpened, WorkTimer, WorkPaused, WorkFinished, BreakTimer, BreakFinished }

export default function Timer({ workTime, breakTime, onPomoFinished } : { workTime: number, breakTime: number, onPomoFinished: () => void }) {

  const [currentState, setCurrentState] = useState<TimerStates>(TimerStates.JustOpened);

  const setAndInitState = (goToState: TimerStates, stateComingFrom?: TimerStates) => {
    setCurrentState(goToState);
    states[goToState].init(stateComingFrom)
  }
  
  const stringify = (secs: number, mins: number) => `${mins}:${secs <= 9 ? "0" : ""}${secs}`;
  
  const currentTimeAtPause = useRef<number>(0);
  const timeStartedMS = useRef<number>(Date.now());
  const timePaused = useRef<number>(0);
  const [timePausedText, setTimePausedText] = useState<string>("0 seconds");
  const [timeText, setTimeText] = useState<string>(stringify(Math.floor(workTime % 60), Math.floor(workTime / 60)))
  const [percentLeft, setPercentLeft] = useState<number>(1)
  
  const openPausePopup = usePausePopupStore(state => state.openPopup);
  const closePausePopup = usePausePopupStore(state => state.closePopup);
  
  const showSwitchPrompt = useSwitchStore(state => state.show);
  
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
      init: () => {
        timeStartedMS.current = Date.now() - breakTime * 1000;

        showSwitchPrompt("You can switch to break");
      },
    },
    [TimerStates.BreakTimer]: {
      tick: () => {
        decreaseTimer(TimerStates.BreakTimer, TimerStates.BreakFinished)
      },
      onSwitchPressed: () => {
        // A very hacky solution. May change if required in the future.
        timeStartedMS.current = Date.now() - breakTime * 1000;

        decreaseTimer(TimerStates.BreakTimer, TimerStates.BreakFinished);
      },
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
      init: () => {
        showSwitchPrompt("Break is over!");
      },
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

  const restart = () => {
    setAndInitState(TimerStates.WorkTimer);
  }
  
  const onPausePressed = () => states[currentState].onPausedPressed()
  const onSwitchPressed = () => {states[currentState].onSwitchPressed(); console.log('proper switching yeah')}

  const setOnSwitchMenu = useSwitchStore(state => state.setOnSwitchMenu);
  useEffect( () => {
    setOnSwitchMenu( () => {
      onSwitchPressed();
    }) 
  }, [onSwitchPressed])

  // two functions to get the final "times" from both of work and break time
  const getFinalWorkTime = () => workTime * 1000 - (Date.now() - timeStartedMS.current) + timePaused.current;
  const getFinalBreakTime = () => breakTime * 1000 - (Date.now() - timeStartedMS.current)
  
  const isPaused = (currentState: TimerStates) => currentState == TimerStates.WorkPaused || currentState == TimerStates.JustOpened;
  const isPauseButtonEnabled = () => currentState == TimerStates.WorkPaused || currentState == TimerStates.WorkTimer || currentState == TimerStates.JustOpened;

  // const progressBarColor = `linear-gradient(-90deg, var(--timer-progress-left) ${percentLeft * 100}%,var(--timer-progress-done) ${percentLeft * 100}%)`
  const newWidth = `${percentLeft * 100}%`;
  
  const reg = useRef<HTMLDivElement>(null);

  return <div className={"timer"}>

    {/* Pop-up related stuff */}
    <RenderPopups timePausedText={timePausedText}/>
    {/* The actual content of the timer */}
    <div className={`progress-bar ${(currentState == TimerStates.BreakTimer || currentState == TimerStates.BreakFinished) && 'break-color'}`} style={{ width: newWidth, height: reg.current?.clientHeight }}> </div>
    <div ref={reg} className="progress-bar-background" >
      <MemoizedTimerContent 
        currentState={currentState}
        isPaused={isPaused(currentState)}
        isPauseButtonEnabled={isPauseButtonEnabled()}
        onPausePressed={onPausePressed}
        onSwitchPressed={onSwitchPressed}
        restart={restart}
        timeText={timeText}
      />
    </div>
  </div>
}

const MemoizedTimerContent = memo(function TimerContent({
  currentState,
  isPaused,
  isPauseButtonEnabled,
  onPausePressed,
  onSwitchPressed,
  restart,
  timeText,
}: {
  currentState: TimerStates;
  isPaused: boolean;
  isPauseButtonEnabled: boolean;
  onPausePressed: () => void;
  onSwitchPressed: () => void;
  restart: () => void;
  timeText: string;
}) {
  return (
    <div style={{ display: 'flex' }}>
      <h1 className="timer-text">{timeText}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '10px', gap: '10px' }}>
       <button
          disabled={!isPauseButtonEnabled}
          onClick={() => {onPausePressed(); console.log("pause pressed?")}}
          className="test"
          style={{ zIndex: isPaused  ? 1000 : 'auto'}} 
        >
          {currentState == TimerStates.JustOpened ? <Play size={18} /> : (isPaused ? <Play size={18} /> : <Pause size={18}/>)}
        </button>
        <button className="test" onClick={() => {(currentState == TimerStates.BreakTimer ? onSwitchPressed : restart)(); console.log("switch pressed?")} } >
          {currentState == TimerStates.BreakTimer ? <FastForward /> : <RotateCcw />}
        </button>
      </div>
    </div>
  );
});

function RenderPopups({ timePausedText } : { timePausedText: string }) {

  return <>
    <Popup usePopupStore={usePausePopupStore}>
      <div className="pause-popup">
        <h2> Timer paused for</h2>
        <h3> {timePausedText}</h3>
      </div>
    </Popup>
  </>
}

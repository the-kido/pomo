import { memo, useEffect, useRef, useState } from "react";
import Popup, { usePausePopupStore } from "./Popup";
import { timeToWords } from "/src/main/utils/utils";
import { FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { create } from "zustand";

interface MessageType {titleText: string, buttonText: string}

interface ShowSwitchPrompt {
  showing: boolean,
  messages: MessageType,
  hide: () => void,
  show: (messages: MessageType) => void,
  onSwitchMenu?: () => void, // <-- Add this
  setOnSwitchMenu: (cb: () => void) => void, // <-- Add setter
}

export const useSwitchStore = create<ShowSwitchPrompt>(set => ({
  showing: false,
  messages: { titleText: "Unset", buttonText: "Unset"},
  show: (messages: MessageType) => set({ showing: true, messages }),
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

export default function Timer({ workTime, breakTime, onPomoFinished, isShrunk } : { workTime: number, breakTime: number, onPomoFinished: () => void, isShrunk: boolean }) {

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

        showSwitchPrompt({ titleText: "Work session over!", buttonText: "Switch to break"});
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
        showSwitchPrompt({ titleText: "Break over!", buttonText: "Switch to work"});
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

  const hideSwitchMenu = useSwitchStore(state => state.hide);
  const restart = () => {
    hideSwitchMenu();

    setAndInitState(TimerStates.WorkTimer);
  }
  
  const onPausePressed = () => states[currentState].onPausedPressed()
  const onSwitchPressed = () => states[currentState].onSwitchPressed()

  const setOnSwitchMenu = useSwitchStore(state => state.setOnSwitchMenu);
  useEffect( () => {
    setOnSwitchMenu( () => {
      onSwitchPressed();
    }) 
  }, [onSwitchPressed])

  // two functions to get the final "times" from both of work and break time
  const getFinalWorkTime = () => workTime * 1000 - (Date.now() - timeStartedMS.current) + timePaused.current;
  const getFinalBreakTime = () => breakTime * 1000 - (Date.now() - timeStartedMS.current)
  
  const isPaused = (currentState: TimerStates) => currentState == TimerStates.WorkPaused;
  const isPauseButtonEnabled = () => currentState == TimerStates.WorkPaused || currentState == TimerStates.WorkTimer || currentState == TimerStates.JustOpened;

  // Track height to update the progress bar with
  const newWidth = `${percentLeft * 100}%`;
  const [barHeight, setBarHeight] = useState<number>(0);
 
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      setBarHeight(ref.current.clientHeight);
    }

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setBarHeight(entries[0].target.clientHeight);
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, []);
 
  return <div className={"timer"}>

    {/* Pop-up related stuff */}
    <RenderPopups timePausedText={timePausedText}/>
    {/* The actual content of the timer */}
    <div className={`progress-bar ${(currentState == TimerStates.BreakTimer || currentState == TimerStates.BreakFinished) && 'break-color'}`} style={{ width: newWidth, height: barHeight }}> </div>
    <div ref={ref} className="progress-bar-background" >
      <MemoizedTimerContent 
        currentState={currentState}
        isPaused={isPaused(currentState)}
        isPauseButtonEnabled={isPauseButtonEnabled()}
        onPausePressed={onPausePressed}
        onSwitchPressed={onSwitchPressed}
        restart={restart}
        timeText={timeText}
        isShrunk={isShrunk}
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
  isShrunk
}: {
  currentState: TimerStates,
  isPaused: boolean,
  isPauseButtonEnabled: boolean,
  onPausePressed: () => void,
  onSwitchPressed: () => void,
  restart: () => void,
  timeText: string,
  isShrunk: boolean
}) {
  const iconSize = isShrunk ? 14 : 18;
  const buttonClassName = `timer-button ${isShrunk && 'timer-button-small'}`

  return (
    <div className="timer-content" style={{ display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: isShrunk ? 'row' : 'column', margin: '10px', gap: '10px' }}>
       <button
          disabled={!isPauseButtonEnabled}
          onClick={() => {onPausePressed(); console.log("pause pressed?")}}
          className={buttonClassName}
          style={{ zIndex: isPaused ? 1000 : 'auto'}} 
        >
          {currentState == TimerStates.JustOpened ? <Play size={iconSize} /> : (isPaused ? <Play size={iconSize} /> : <Pause size={iconSize}/>)}
        </button>
        <button className={buttonClassName} onClick={() => {(currentState == TimerStates.BreakTimer ? onSwitchPressed : restart)(); console.log("switch pressed?")} } >
          {currentState == TimerStates.BreakTimer ? <FastForward size={iconSize} /> : <RotateCcw size={iconSize}/>}
        </button>
      </div>
      <h1 className="timer-text" style={ isShrunk ? {transform: 'translateX(calc(-100% - 10px)) translateY(5%)', left: '100%', fontSize: '30px'} : {fontSize: '50px'}} >{timeText}</h1>
    </div>
  );
});

function RenderPopups({ timePausedText } : { timePausedText: string }) {

  return <>
    <Popup usePopupStore={usePausePopupStore}>
      <h2> Timer paused for</h2>
      <h3> {timePausedText}</h3>
    </Popup>
  </>
}

import { JSX, useEffect, useRef, useState } from 'react';
import { PomoActivityType, PomoActivityTypeDisplay, PomodoroTimerInfo, SELECT_GOAL } from '/src/types/Pomodoro';
import Subtask from './Subtask';
import Timer, { useSwitchStore } from './Timer';
import { create } from 'zustand';
import Header from './Header';
import { useUserSettingsStore } from '/src/main/states/userDataStates';
import TransitionWrapper from './TransitionWrapper';

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

export default function Pomodoro({ info }: { info?: PomodoroTimerInfo }) {
  const [pomosCompleted, setPomosCompleted] = useState<number>(info.completed);

  // Required for if we're using the shrunk or not shrunk version of the UI
  const [isShrunk, setIsShrunk] = useState<boolean>(false);
  const pomoWindow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.pomodoro.sendPomodoroUpdate({ ...info, completed: pomosCompleted });
  }, [pomosCompleted])
  
  const darkMode = useUserSettingsStore(store => store.darkMode);
  
  useEffect(() => {
		document.body.classList.toggle("dark", darkMode);
	}, [darkMode])
  
  const updatePomodorosCompleted = () => {
    window.pomodoro.incrementPomosDone();
    setPomosCompleted(prev => prev + 1);
  }

  function onPomodoroClose() {
    window.pomodoro.attemptClose();
  }
  
  function onPomodoroMinimize() {
    window.pomodoro.attemptMinimize();
  }

  function onToggleSize(newSize: boolean) {
    setIsShrunk(newSize);
  }

  useEffect(() => {
    // Check if we are editing. If so, we close out of it early
    if (isShrunk) useUpdatingState.getState().finishSettingDescription();

    // This runs after isShrunk changes and the DOM/layout is updated
    window.pomodoro.changeSize(pomoWindow.current.scrollWidth, pomoWindow.current.scrollHeight, isShrunk);
  }, [isShrunk]);

  // Required to set pomodoro window to correct size on first load
  useEffect(() => {
    // Wait for the DOM to settle
    const timer = setTimeout(() => {
      if (pomoWindow.current) {
        window.pomodoro.changeSize(pomoWindow.current.scrollWidth, pomoWindow.current.scrollHeight, isShrunk);
      }
    }, 100); // Wait for some arbitrary time so all is set in stone

    return () => clearTimeout(timer);
  }, []);

  const updating = useUpdatingState(state => state.updating);
  const showing = useSwitchStore(state => state.showing);

  return <>
		<div id='portal-root'></div>
		<div ref={pomoWindow} className="pomo">
			<Header onClose={onPomodoroClose} isShrunk={isShrunk} toggleSize={onToggleSize} minimize={onPomodoroMinimize} />
			<div className="main-info">
				{/* This is the first "square" w/ the main info */}
				<Timer
					workTime={5/*info.startTimeSeconds*/}
					breakTime={info.breakTimeSeconds}
					onPomoFinished={updatePomodorosCompleted}
          isShrunk={isShrunk}
				/>
				<div className='component-container' style={{minHeight: isShrunk ? '50px' : '85px'}}>
				  <TransitionWrapper show={!isShrunk && updating}>
            <EditTaskInfo info={info} />
          </TransitionWrapper>
          
          <TransitionWrapper show={showing && !updating}>
            <Switch isShrunk={isShrunk}/>
          </TransitionWrapper>
          
          <TransitionWrapper show={!showing && !updating}>
            <TaskInfo info={info} pomosCompleted={pomosCompleted} isShrunk={isShrunk}/>
          </TransitionWrapper>
				</div>
        
	  		<div className='subtask-list'>
         <SubtasksInfo 
            info={info}
            isShrunk={isShrunk}
          />
        </div>
			</div>
		</div>
  </>
}

function Switch({ isShrunk } : { isShrunk: boolean }) {
	const messages = useSwitchStore(state => state.messages);
	const hide = useSwitchStore(state => state.hide);
	const onSwitch = useSwitchStore(state => state.onSwitchMenu);

	return <>
    {!isShrunk && <h2>{messages.titleText}</h2>}
		<button className='pulse-notify' onClick={() => {
			onSwitch();
			hide();
		}}>{messages.buttonText}</button>
	</>
}

function TaskInfo({ info, pomosCompleted, isShrunk } : { info: PomodoroTimerInfo, pomosCompleted: number, isShrunk: boolean } ) {
  const setDescription = useUpdatingState(state => state.setDescription);

  var activityTypeText = PomoActivityTypeDisplay[info.type];
  var goalText = info.goal;

	return <>
		<h2 
      className={`description ${(!isShrunk) && "text-editable"}`} 
      onClick={isShrunk ? undefined : setDescription}
      style={{padding: '0px var(--medium-padding)', fontSize: isShrunk ? 'large' : 'x-large' }}
    > 
      {info.task} </h2>
		{ !isShrunk && <div className='misc-info'>
			<div style={{ display: 'flex' }}>
				{ info.type != PomoActivityType.UNKNOWN && <h4 className='chip'>{activityTypeText}</h4> }
				{ goalText != SELECT_GOAL && <h4 className='chip'>{goalText}</h4>}
			</div>
			<h4>🍅 x{pomosCompleted}</h4>
		</div> }
	</>
}

function EditTaskInfo({ info } : { info: PomodoroTimerInfo }) {
  const discTextField = useRef<HTMLInputElement>(null);
	
	const finishSettingDescription = useUpdatingState(state => state.finishSettingDescription);
	
	function onDescriptionChangeCancel() {
    finishSettingDescription();
  }

  function onDescriptionChangeSaved(newValue: string) {
    info.task = newValue;
    finishSettingDescription();

    window.pomodoro.sendPomodoroUpdate({ ...info, task: newValue });
  }
	
  return (
    <div style={{
      margin: 'var(--medium-padding) var(--menu-padding)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--medium-padding)'
    }}>
      <input 
        type="text" 
        className="edit-description-area" ref={discTextField} defaultValue={info.task}></input>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onDescriptionChangeCancel}>Cancel</button>
        <button onClick={() => onDescriptionChangeSaved(discTextField.current.value)}>Finish</button>
      </div>
    </div>
  )
}

function SubtasksInfo({ info, isShrunk } : { info : PomodoroTimerInfo, isShrunk: boolean }) {
  const [subtasksCompletedIndicies, setSubtasksCompletedIndicies] = useState<number[]>(info.subtasksCompletedIndicies);
  
	var progress = 1.0 * subtasksCompletedIndicies.length / info.subtasks.length;

  const subtaskProgressBarColor = `linear-gradient(-90deg,rgba(255, 255, 255, 0) ${(1 - progress) * 100}%,var(--subtask-progress-green) ${(1 - progress) * 100}%)`

	useEffect(() => {
    window.pomodoro.sendPomodoroUpdate({ ...info, subtasksCompletedIndicies: subtasksCompletedIndicies });
  }, [subtasksCompletedIndicies])

	return ( info.subtasks.length > 0 && <>
		{/* For the "progress bar" */}
		<div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
			<h2 className='progress-bar-text'>
				{`${subtasksCompletedIndicies.length}/${info.subtasks.length}`}
			</h2>
			<div className='subtask-progress-bar' style={{ background: subtaskProgressBarColor, height: '10px' }} ></div>
		</div>
		{/* For the list of subtasks */}
		{!isShrunk && <SubtaskList 
			info={info}
			subtasksCompletedIndicies={subtasksCompletedIndicies}
			setSubtasksCompletedIndicies={setSubtasksCompletedIndicies}
		/> }
	</> )
}

function SubtaskList({info, subtasksCompletedIndicies, setSubtasksCompletedIndicies} : { info: PomodoroTimerInfo, subtasksCompletedIndicies: number[], setSubtasksCompletedIndicies: React.Dispatch<React.SetStateAction<number[]>> }) {
	
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

	var tasks = setupSubtasks();

	return <>
		{tasks.array}
		{tasks.leftover > 0 && <p> {`. . . (${tasks.leftover} more)`}</p>}
	</>
}
import { JSX, useEffect, useRef, useState } from 'react';
import { PomoActivityTypeDisplay, PomodoroTimerInfo } from '/src/types/Pomodoro';
import Subtask from './Subtask';
import Timer, { useSwitchStore } from './Timer';
import { create } from 'zustand';
import Header from './Header';
import { useUserSettingsStore } from '/src/main/states/userDataStates';

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
    window.pomodoro.attemptClose(info);
  }

  function onToggleSize(newSize: boolean) {
    setIsShrunk(newSize);
  }

  useEffect(() => {
    // This runs after isShrunk changes and the DOM/layout is updated
    window.pomodoro.changeSize(pomoWindow.current.scrollWidth, pomoWindow.current.scrollHeight);
  }, [isShrunk]);

  // Required to set pomodoro window to correct size on first load
  useEffect(() => {
    // Wait for the DOM to settle
    const timer = setTimeout(() => {
      if (pomoWindow.current) {
        window.pomodoro.changeSize(pomoWindow.current.scrollWidth, pomoWindow.current.scrollHeight);
      }
    }, 100); // Wait for some arbitrary time so all is set in stone

    return () => clearTimeout(timer);
  }, []);

  const updating = useUpdatingState(state => state.updating);
  const showing = useSwitchStore(state => state.showing);

  return <>
		<div id='portal-root'></div>
		<div ref={pomoWindow} className="pomo">
			<Header onClose={onPomodoroClose} isShrunk={isShrunk} toggleSize={onToggleSize} />
			<div className="main-info">
				{/* This is the first "square" w/ the main info */}
				<Timer
					workTime={/*info.startTimeSeconds*/ 5}
					breakTime={info.breakTimeSeconds}
					onPomoFinished={updatePomodorosCompleted}
				/>
				<div style={{height: '90px'}}>
				{ updating ? <EditTaskInfo info={info} /> : 
				showing ? <Switch  /> : <TaskInfo info={info} pomosCompleted={pomosCompleted} /> }
				</div>
			</div>
			<SubtasksInfo 
				info={info}
				isShrunk={isShrunk}
			/>
		</div>
  </>
}

function Switch( ) {
	const message = useSwitchStore(state => state.message);
	const hide = useSwitchStore(state => state.hide);
	const onSwitch = useSwitchStore(state => state.onSwitchMenu);


	return <>
		<button onClick={() => {
			onSwitch();
			hide();
		}}>{message}</button>
	</>
}

function TaskInfo({ info, pomosCompleted } : { info: PomodoroTimerInfo, pomosCompleted: number } ) {
  const setDescription = useUpdatingState(state => state.setDescription);

	return <>
		<h2 className='description' onClick={setDescription} > {info.task} </h2>
		<div className='misc-info'>
			<div style={{ display: 'flex' }}>
				<h4 className='chip'>{PomoActivityTypeDisplay[info.type]}</h4>
				<h4 className='chip'>{info.goal}</h4>
			</div>
			<h4>🍅 x{pomosCompleted}</h4>
		</div>
	</>
}

function EditTaskInfo({ info } : { info: PomodoroTimerInfo }) {
  const discTextField = useRef<HTMLTextAreaElement>(null);
	
	const finishSettingDescription = useUpdatingState(state => state.finishSettingDescription);

	
	function onDescriptionChangeCancel() {
    finishSettingDescription();
  }

  function onDescriptionChangeSaved(newValue: string) {
    info.task = newValue;
    finishSettingDescription();

    window.pomodoro.sendPomodoroUpdate({ ...info, task: newValue });
  }
	
	return <>
		<textarea ref={discTextField} defaultValue={info.task}></textarea>
		<div style={{ display: 'flex' }}>
			<input type='button' defaultValue={"Cancel"} onClick={onDescriptionChangeCancel}></input>
			<input type='button' defaultValue={"Finish"} onClick={() => onDescriptionChangeSaved(discTextField.current.value)}></input>
		</div>
	</>
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
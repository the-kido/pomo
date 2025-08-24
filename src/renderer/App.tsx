import { useEffect, useState } from "react";
import CreatePomodoro from "./main/createPomodoro/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";
import { useUserDataStore, useUserSettingsStore } from "../main/states/userDataStates";
import { UserData } from "../types/UserData";

import { Heatmap } from "./main/heatmap/Heatmap";

import '../main/states/userDataStates'
import { createContext } from "react";
import Sidebar from "./main/Sidebar";
import SettingsModal from "./main/settings/Settings";

enum USER_ACTIONS {
	EDITING_POMODORO = "editing_pomodoro",
	VIEWING_SETTINGS = "viewing_settings",
}

export interface AppContext {
    saveData: () => void,
	currentUserActions: USER_ACTIONS[]
}

export enum Menu {
	HOME_PAGE = 'Home Page',
	QUICK_POMO = 'Quick Pomodoro',
	STATS = 'Statistics',
	COMPLETED = 'Completed Tasks',
}
export const AppContext = createContext<AppContext>(undefined)

export default function App() {

	const darkMode = useUserSettingsStore(store => store.darkMode);
	const [ menuAt, setMenuAt ] = useState<Menu>(Menu.HOME_PAGE) 

	const saveData = () => {
		window.app.saveData(useUserDataStore.getState().getUserData());
	};

	useEffect(() => {
		// Deal with recieving the initial loaded data from the main process
		window.app.onDidFinishLoad((data: UserData) => {
			useUserDataStore.getState().loadUserData(data);
		});
	}, []);

	useEffect( () => {
		document.body.classList.toggle("dark", darkMode);
	}, [darkMode])

	return <AppContext.Provider value={{ saveData: saveData, currentUserActions: [] }}> 
		<div className="app" >
			{/* Sidebar */}
			<Sidebar menuAt={menuAt} setMenuAt={(newMenu) => setMenuAt(newMenu) } />
	
			{/* Main container */} 
			<div className="main-container">
				{/* Top Overlayed Bar */}
				<div className="top-bar"> </div>
				
				<div className="main-content" style={{maxWidth: "38rem"}}>
					{ menuAt == Menu.HOME_PAGE && <HomeMenu /> }
					{ menuAt == Menu.STATS && <StatsMenu /> }
					{ menuAt == Menu.COMPLETED && <CompletedTasksMenu /> }
					{ menuAt == Menu.QUICK_POMO && <QuickPomoMenu /> }
				</div>
			</div>
		</div> 
		<SettingsModal />
	</AppContext.Provider>
}

function HomeMenu() {
	// Band-aid solution to "entirely" reset CreatePomodoro
	const [key, setKey] = useState<number>(0);

	return <>
		<h1> Create a Pomodoro </h1>
		<CreatePomodoro key={key} resetFields={() => setKey(key => key + 1)} />
		<h1> Saved Pomodoros </h1>
		<PomodoroList />
	</>
}

function QuickPomoMenu() {
	return <>

	</>
}

function StatsMenu() {
	return <>
		<h1> Your Statistics </h1>
		<Heatmap />
	</>
}

function CompletedTasksMenu() {
	return <>
		<h1> Your Completed Pomos </h1>
	</>
}
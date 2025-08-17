import { useEffect, useState } from "react";
import CreatePomodoro from "./main/createPomodoro/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";
import { useUserDataStore } from "../main/states/userDataStates";
import { UserData } from "../types/UserData";

import '../main/states/userDataStates'
import { createContext } from "react";
import Sidebar from "./main/Sidebar";

export interface AppContext {
    saveData: () => void,
}

export const AppContext = createContext<AppContext>(undefined)

export default function App() {

	const saveData = () => {
		window.app.saveData(useUserDataStore.getState().getUserData());
	};

	useEffect(() => {
		// Deal with recieving the initial loaded data from the main process
		window.app.onDidFinishLoad((data: UserData) => {
			useUserDataStore.getState().loadUserData(data);
		});
	}, []);

	// Band-aid solution to "entirely" reset CreatePomodoro
	const [key, setKey] = useState<number>(0);

	return <AppContext.Provider value={{saveData: saveData}}> 
		<div className="app" >
			{/* Sidebar */}
			<Sidebar />
	
			{/* Main container */} 
			<div className="main-container">
				{/* Top Overlayed Bar */}
				<div className="top-bar"> </div>
				
				<div className="main-content" style={{maxWidth: "38rem"}}>
					<h1> Create a Pomodoro </h1>
					<CreatePomodoro key={key} reset={() => setKey(key => key + 1)} />
					<h1> Saved Pomodoros </h1>
					<PomodoroList />
				</div>
			</div>
		</div> 
	</AppContext.Provider>
}
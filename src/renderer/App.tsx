import { useEffect, useState } from "react";
import CreatePomodoro from "./main/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";
import { useUserDataStore } from "../main/states/states";
import { UserData } from "../types/UserData";

import '/src/main/states/states'
import { createContext } from "react";

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

	return <AppContext.Provider value={{saveData: saveData}} >
		<button onClick={() => window.ollama.generateText("Given a website titled a - Google Search (https://www.google.com/search?client=firefox-b-d&q=a+), briefly summarize its likely content and explain if it's PRODUCTIVE or a DISTRACTION.").then(a => console.log(a)) } >test</button>
		<div className="main">
			<h1> Create a Pomodoro </h1>
			<CreatePomodoro key={key} reset={() => setKey(key => key + 1)} />
			<h1> Saved Pomodoros </h1>
			<PomodoroList />
		</div>
	</AppContext.Provider>
}
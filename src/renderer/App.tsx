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
        // Update persistent data on pomodoro change
        window.pomodoro.onUpdate((_) => {
            saveData()
        })
    }, []);

    // Band-aid solution to "entirely" reset CreatePomodoro
    const [key, setKey] = useState<number>(0);

    return <AppContext.Provider value={{saveData: saveData}} >
        <h1> Create a Pomodoro </h1>
        <CreatePomodoro key={key} reset={() => setKey(key => key + 1)} />
        <h1> Saved Pomodoros </h1>
        <PomodoroList />
    </AppContext.Provider>
}
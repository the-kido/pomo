import { useEffect, useState } from "react";
import CreatePomodoro from "./main/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";
import { useUserDataStore } from "../main/states/states";
import { UserData } from "../types/UserData";

import '/src/main/states/states'

export default function App() {
    // Deal with recieving the initial loaded data from the main process
    useEffect(() => {
        window.app.onDidFinishLoad((data: UserData) => {
            useUserDataStore.getState().loadUserData(data);
        });
    }, []);

    // Band-aid solution to "entirely" reset CreatePomodoro
    const [key, setKey] = useState<number>(0);

    return <>
        <h1> Create a Pomodoro </h1>
        <CreatePomodoro key={key} reset={() => setKey(key => key + 1)} />
        <h1> Saved Pomodoros </h1>
        <PomodoroList />
    </>
}
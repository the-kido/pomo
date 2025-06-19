import CreatePomodoro from "./main/CreatePomodoro";
import PomodoroList from "./main/PomodoroList";

export default function App()
{
    return <>
        <h1>
            Create a Pomodoro
        </h1>
        <CreatePomodoro/>
        <h1>
            Previous
        </h1>
        <PomodoroList/>
    </> 
}
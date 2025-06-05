export type PomodoroRendererExports = {
    createWindow: (fileToLoad: PomodoroTimerInfo, options: Electron.BrowserWindowConstructorOptions) => void,
    onInit: (callback: (data: PomodoroTimerInfo) => void) => void;
    sendUpdate: (data: PomodoroTimerInfo) => void;
    onUpdate: (callback: (data: PomodoroTimerInfo) => void) => void;
    attemptClose: (data: PomodoroTimerInfo) => void;
    onClosed: (callback: () => void) => void;
};

export interface PomodoroTimerInfo
{
    received: boolean
    mainTask: string,
    startTimeSeconds: number,
    breakTimeSeconds: number,
    subtasks: string[]
}


export interface Window {
    pomodoro: PomodoroRendererExports
}

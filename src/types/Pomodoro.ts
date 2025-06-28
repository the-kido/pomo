export type PomodoroRendererExports = {
    createWindow: (fileToLoad: PomodoroTimerInfo, options: Electron.BrowserWindowConstructorOptions) => void,
    onInit: (callback: (data: PomodoroTimerInfo) => void) => void;
    sendUpdate: (data: PomodoroTimerInfo) => void;
    onUpdate: (callback: (data: PomodoroTimerInfo) => void) => void;
    onUnsubUpdate: () => void;
    attemptClose: (data: PomodoroTimerInfo) => void;
    onClosed: (callback: () => void) => void;
};

export interface PomodoroTimerInfo {
    // Listed in order of what is inputted by the pomodoro creator
    type: "active" | "chill" | "unknown",
    goal?: string,
    task: string,
    motivation: string,
    nextReward: string,
    subtasks: string[]
    startTimeSeconds: number,
    breakTimeSeconds: number,
    received: boolean,
    completed: number,
    timeCreated: number,
}

export interface Window {
    pomodoro: PomodoroRendererExports
}

import { PomodoroTimerInfo } from "./Pomodoro";

export type PomodoroRendererExports = {
	createWindow: (fileToLoad: PomodoroTimerInfo, options: Electron.BrowserWindowConstructorOptions) => void,
	onInit: (callback: (data: PomodoroTimerInfo) => void) => void;
	sendUpdate: (data: PomodoroTimerInfo) => void;
	onUpdate: (callback: (data: PomodoroTimerInfo) => void) => void;
	onUnsubUpdate: () => void;
	attemptClose: (data: PomodoroTimerInfo) => void;
	onClosed: (callback: () => void) => void;
	changeSize: (x: number, y: number) => void;
};

export const CHANNELS = {
	fromPomodoroMain: {
		onInit: 'init-pomodoro',
		onClose: 'pomodoro-window-closed',
		onSendUpdate: 'update-pomodoro'
	} as const,
	fromPomodoroRenderer: {
		onClose: 'closed-pomodoro',
		changeWindowSize: 'change-window-size',
		onSaveData: 'save-data',
		onSendUpdate: 'sending-pomo-update'
	} as const,
	fromMainProcess: {
		hydrateUserData: 'hydrate-user-data',
		ollamaStateChanged: 'ollama-state-changed',
		onExtensionStateChanged: 'extension-state-changed',
	} as const,
	fromMainRenderer: {
		onCreateWindow: 'createWindow'
	} as const
} as const;
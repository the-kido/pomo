import { DayWork, DayWorkDict, PomodoroTimerInfo } from "./Pomodoro";
import { UserData } from "./UserData";

export type PomodoroRendererExports = {
	createWindow: ( fileToLoad: PomodoroTimerInfo, options: Electron.BrowserWindowConstructorOptions) => void,
	onInit: (callback: (data: PomodoroTimerInfo) => void) => void;
	incrementPomosDone: () => void;
	sendPomodoroUpdate: (data: PomodoroTimerInfo) => void;

	onUpdateData: (callback: (data: UserData) => void) => void;
	onUnsubUpdateData: () => void;

	// onPomodoroUpdate: (callback: (data: PomodoroTimerInfo) => void) => void;
	// onSessionUpdate: (callback: (data: DayWorkDict) => void) => void;
	// onUnsubPomoUpdate: () => void;
	// onUnsubSessionUpdate: () => void;
	attemptClose: (data: PomodoroTimerInfo) => void;
	onClosed: (callback: () => void) => void;
	changeSize: (x: number, y: number) => void;
};

export const CHANNELS = {
	fromPomodoroMain: {
		onInit: 'init-pomodoro',
		onClose: 'pomodoro-window-closed',
		// onSendPomodoroUpdate: 'update-pomodoro',
		// onSendSessionUpdate: 'update-session'
	} as const,
	fromPomodoroRenderer: {
		onClose: 'closed-pomodoro',
		changeWindowSize: 'change-window-size',
		onSaveData: 'save-data',
		onSendPomodoroUpdate: 'sending-pomo-update',
		onIncrementPomosDone: 'sending-increment-pomos-done'
	} as const,
	fromMainProcess: {
		hydrateUserData: 'hydrate-user-data',
		ollamaStateChanged: 'ollama-state-changed',
		onExtensionStateChanged: 'extension-state-changed',
		onUpdate: 'send-update'
	} as const,
	fromMainRenderer: {
		onCreateWindow: 'createWindow'
	} as const
} as const;
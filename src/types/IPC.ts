import { DayWork, DayWorkDict, PomodoroTimerInfo } from "./Pomodoro";
import { UserData } from "./UserData";

export type PomodoroRendererExports = {
	launchPomodoroWindow: ( fileToLoad: PomodoroTimerInfo, options: Electron.BrowserWindowConstructorOptions) => void,
	onInit: (callback: (data: PomodoroTimerInfo) => void) => void;
	incrementPomosDone: () => void;
	sendPomodoroUpdate: (data: PomodoroTimerInfo) => void;

	onUpdateData: (callback: (data: UserData) => void) => void;
	onUnsubUpdateData: () => void;
	attemptClose: () => void;
	attemptMinimize: () => void;
	onClosed: (callback: () => void) => void;
	changeSize: (x: number, y: number) => void;
};

export const CHANNELS = {
	fromPomodoroMain: {
		onInit: 'init-pomodoro',
		onClose: 'pomodoro-window-closed',
	} as const,
	fromPomodoroRenderer: {
		onClose: 'closed-pomodoro',
		onMinimize: 'minimized-pomodoro',
		changeWindowSize: 'change-window-size',
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
		onSaveData: 'save-data',
		onLaunchPomodoroWindow: 'createWindow',
		minimizeMain: 'minimize-main-window',
		maximizeMain: 'maximize-main-window',
		closeMain: 'close-main-window',
	} as const
} as const;
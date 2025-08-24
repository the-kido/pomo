// import {} from 'prod-app-shared'
import { DayWorkDict, PomodoroTimerInfo } from '/src/types/Pomodoro'
import { contextBridge, ipcRenderer } from 'electron'
import { UserData } from '/src/types/UserData';
import { LLMResult } from '/src/main/ai/ollama';
import { CHANNELS, PomodoroRendererExports } from '/src/types/IPC';

declare global {
	interface Window {
		pomodoro: PomodoroRendererExports,
		app: { 
			onDidFinishLoad: (callback: (data: UserData) => void) => void,
			saveData: (data: Partial<UserData>) => void,
		},
		ollama: {
			generateText: (prompt: string) => Promise<LLMResult>
		},
		states: {
			onOllamaStateChanged: (callback: (isOllamaActive: boolean) => void) => void,
			onExtensionStateChanged: (callback: (isExtensionConnected: boolean) => void) => void
		}
	}
}

var prevOnPomoUpdateListener: (event: Electron.IpcRendererEvent, ...args: any[]) => void;
var prevOnSessionUpdateListener: (event: Electron.IpcRendererEvent, ...args: any[]) => void;
var prevOnClosedListener: (event: Electron.IpcRendererEvent) => void;

contextBridge.exposeInMainWorld('pomodoro', {
	createWindow: (idx: number, fileToLoad: string, options: Electron.BrowserWindowConstructorOptions) : void => {
		ipcRenderer.send(CHANNELS.fromMainRenderer.onCreateWindow, idx, fileToLoad, options)
	},
	onUpdateData: (callback: (data: UserData) => void) => {
		console.log('On update data');
		prevOnPomoUpdateListener = (_event, data) => {console.log("callback!", data); callback(data)}
		ipcRenderer.on(CHANNELS.fromMainProcess.onUpdate, prevOnPomoUpdateListener)
	},
	onUnsubUpdateData: () => {
		
	},

	// onPomodoroUpdate: (callback: (data: PomodoroTimerInfo) => void) => {
	// 	prevOnPomoUpdateListener = (_event, data) => callback(data)
	// 	ipcRenderer.on(CHANNELS.fromPomodoroMain.onSendPomodoroUpdate, prevOnPomoUpdateListener)
	// },
	// onUnsubPomoUpdate: () => {
	// 	ipcRenderer.removeListener(CHANNELS.fromPomodoroMain.onSendPomodoroUpdate, prevOnPomoUpdateListener)
	// },
	// onSessionUpdate: (callback: (data: DayWorkDict) => void) => {
	// 	prevOnSessionUpdateListener = (_event, data) => callback(data)
	// 	ipcRenderer.on(CHANNELS.fromPomodoroMain.onSendSessionUpdate, prevOnSessionUpdateListener)
	// },
	// onUnsubSessionUpdate: () => {
	// 	ipcRenderer.removeListener(CHANNELS.fromPomodoroMain.onSendSessionUpdate, prevOnSessionUpdateListener)
	// },
	onClosed: (callback: () => void) => {
		if (prevOnClosedListener) {
			ipcRenderer.removeListener(CHANNELS.fromPomodoroMain.onClose, prevOnClosedListener)
		}
		prevOnClosedListener = () => callback()
		ipcRenderer.on(CHANNELS.fromPomodoroMain.onClose, prevOnClosedListener);
	}
});

contextBridge.exposeInMainWorld('app', {
	onDidFinishLoad: (callback: (data: UserData) => void) => {
		ipcRenderer.addListener(CHANNELS.fromMainProcess.hydrateUserData, (_, data: UserData) => callback(data))
	},
	saveData: (data: Partial<UserData>) => {
		console.log("??")
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onSaveData, data);
	}
});

contextBridge.exposeInMainWorld('ollama', {
	generateText: (prompt: string) : Promise<LLMResult> => ipcRenderer.invoke('generate', prompt),
});

contextBridge.exposeInMainWorld('states', {
	onOllamaStateChanged: (callback: (isOllamaActive: boolean) => void) => ipcRenderer.addListener(CHANNELS.fromMainProcess.ollamaStateChanged, (_, change) => callback(change)),
	onExtensionStateChanged: (callback: (isExtensionConnected: boolean) => void) => ipcRenderer.addListener(CHANNELS.fromMainProcess.onExtensionStateChanged, (_, change) => callback(change))
})
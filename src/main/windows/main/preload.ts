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
		},
		windowControl: {
			minimize: () => void,
			maximize: () => void,
			close: () => void
		}
	}
}

var onUpdateDataCallback: (event: Electron.IpcRendererEvent, ...args: any[]) => void;
var prevOnClosedListener: (event: Electron.IpcRendererEvent) => void;

contextBridge.exposeInMainWorld('pomodoro', {
	launchPomodoroWindow: (fileToLoad: string, options: Electron.BrowserWindowConstructorOptions) : void => {
		ipcRenderer.send(CHANNELS.fromMainRenderer.onLaunchPomodoroWindow, fileToLoad, options)
	},
	onUpdateData: (callback: (data: UserData) => void) => {
		console.log('onUpdateData');
		onUpdateDataCallback = (_event, data) => callback(data)
		ipcRenderer.on(CHANNELS.fromMainProcess.onUpdate, onUpdateDataCallback)
	},
	onUnsubUpdateData: () => {
		
	},
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
		ipcRenderer.send(CHANNELS.fromMainRenderer.onSaveData, data);
	}
});

contextBridge.exposeInMainWorld('ollama', {
	generateText: (prompt: string) : Promise<LLMResult> => ipcRenderer.invoke('generate', prompt),
});

contextBridge.exposeInMainWorld('states', {
	onOllamaStateChanged: (callback: (isOllamaActive: boolean) => void) => ipcRenderer.addListener(CHANNELS.fromMainProcess.ollamaStateChanged, (_, change) => callback(change)),
	onExtensionStateChanged: (callback: (isExtensionConnected: boolean) => void) => ipcRenderer.addListener(CHANNELS.fromMainProcess.onExtensionStateChanged, (_, change) => callback(change))
})

contextBridge.exposeInMainWorld('windowControl', {
	minimize: () => ipcRenderer.send(CHANNELS.fromMainRenderer.minimizeMain),
	maximize: () => ipcRenderer.send(CHANNELS.fromMainRenderer.maximizeMain),
	close: () => ipcRenderer.send(CHANNELS.fromMainRenderer.closeMain)
})
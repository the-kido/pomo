import { contextBridge, ipcRenderer } from 'electron';
import { PomodoroTimerInfo } from '../../../types/Pomodoro';
import { CHANNELS, PomodoroRendererExports } from '/src/types/IPC';
import { UserData } from '/src/types/UserData';

declare global {
	interface Window {
		pomodoro: PomodoroRendererExports
	}
}

var onUpdateDataCallback: (event: Electron.IpcRendererEvent, ...args: any[]) => void;

// Exposes functions that the *renderers* can call.
contextBridge.exposeInMainWorld('pomodoro', {
	onInit: (callback: (data: PomodoroTimerInfo) => void) => {
		ipcRenderer.on(CHANNELS.fromPomodoroMain.onInit, (_event: any, data: any) => callback(data))
	},
	attemptClose: (data: PomodoroTimerInfo) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onClose, data)
	},
	sendPomodoroUpdate: (data: PomodoroTimerInfo) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onSendPomodoroUpdate, data)
	},
	incrementPomosDone: () => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onIncrementPomosDone)
	},
	changeSize : (x: number, y: number) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.changeWindowSize, x, y)
	},
	onUpdateData: (callback: (data: UserData) => void) => {
		console.log('On update data');
		onUpdateDataCallback = (_event, data) => callback(data)
		ipcRenderer.on(CHANNELS.fromMainProcess.onUpdate, onUpdateDataCallback)
	},
});
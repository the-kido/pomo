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
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onClose)
	},
	attemptMinimize: (data: PomodoroTimerInfo) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onMinimize)
	},
	sendPomodoroUpdate: (data: PomodoroTimerInfo) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onSendPomodoroUpdate, data)
	},
	incrementPomosDone: () => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onIncrementPomosDone)
	},
	changeSize : (x: number, y: number, isShrunk: boolean) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.changeWindowSize, x, y, isShrunk)
	},
	showNotification: (title: string, options?: Electron.NotificationConstructorOptions) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.showNotification, title, options)
	},
	onUpdateData: (callback: (data: UserData) => void) => {
		console.log('On update data');
		onUpdateDataCallback = (_event, data) => callback(data)
		ipcRenderer.on(CHANNELS.fromMainProcess.onUpdate, onUpdateDataCallback)
	},
});
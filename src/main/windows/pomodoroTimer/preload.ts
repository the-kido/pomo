import { contextBridge, ipcRenderer } from 'electron';
import { PomodoroTimerInfo } from '../../../types/Pomodoro';
import { CHANNELS, PomodoroRendererExports } from '/src/types/IPC';

declare global {
	interface Window {
		pomodoro: PomodoroRendererExports
	}
}

// Exposes functions that the *renderers* can call.
contextBridge.exposeInMainWorld('pomodoro', {
	onInit: (callback: (data: PomodoroTimerInfo) => void) => {
		ipcRenderer.on(CHANNELS.fromPomodoroMain.onInit, (_event: any, data: any) => callback(data))
	},
	attemptClose: (data: PomodoroTimerInfo) =>{
		// "send FROM renderer to main process"
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onClose, data)
	},
	sendUpdate: (data: PomodoroTimerInfo) => {
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.onSendUpdate, data)
	},
	changeSize : (x: number, y: number) => 
		ipcRenderer.send(CHANNELS.fromPomodoroRenderer.changeWindowSize, x, y)
});
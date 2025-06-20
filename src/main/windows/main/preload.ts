import {} from 'prod-app-shared'
import { PomodoroRendererExports, PomodoroTimerInfo } from '../../../types/Pomodoro'
import { contextBridge, ipcRenderer } from 'electron'

declare global {
    interface Window {
        pomodoro: PomodoroRendererExports
    }
}

var prevListener: (event: Electron.IpcRendererEvent, ...args: any[]) => void;

contextBridge.exposeInMainWorld('pomodoro', {
    createWindow: (fileToLoad: string, options: Electron.BrowserWindowConstructorOptions) : void => {
        ipcRenderer.invoke('createWindow', fileToLoad, options)
    },
    onUpdate: (callback: (data: PomodoroTimerInfo) => void) => {
        console.log("i should be getting something!")
        prevListener = (_event, data) => callback(data)
        ipcRenderer.on('update-pomodoro', prevListener)
    },
    
    onUnsubUpdate: () => {
        console.log("i should be REMOVING something!")
        console.log(ipcRenderer.listenerCount('update-pomodoro') )
        ipcRenderer.removeListener('update-pomodoro', prevListener)
    },
    
    onClosed: (callback: () => void) => {
        ipcRenderer.removeAllListeners('pomodoro-window-closed');
        ipcRenderer.on('pomodoro-window-closed', () => callback());
    }
});
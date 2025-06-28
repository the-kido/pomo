// import {} from 'prod-app-shared'
import { PomodoroRendererExports, PomodoroTimerInfo } from '/src/types/Pomodoro'
import { contextBridge, ipcRenderer } from 'electron'

declare global {
    interface Window {
        pomodoro: PomodoroRendererExports
    }
}

var prevOnUpdateListener: (event: Electron.IpcRendererEvent, ...args: any[]) => void;
var prevOnClosedListener: (event: Electron.IpcRendererEvent) => void;

contextBridge.exposeInMainWorld('pomodoro', {
    createWindow: (fileToLoad: string, options: Electron.BrowserWindowConstructorOptions) : void => {
        ipcRenderer.invoke('createWindow', fileToLoad, options)
    },
    onUpdate: (callback: (data: PomodoroTimerInfo) => void) => {
        prevOnUpdateListener = (_event, data) => callback(data)
        ipcRenderer.on('update-pomodoro', prevOnUpdateListener)
    },
    
    onUnsubUpdate: () => {
        ipcRenderer.removeListener('update-pomodoro', prevOnUpdateListener)
    },
    
    onClosed: (callback: () => void) => {
        
        if (prevOnClosedListener) {
            ipcRenderer.removeListener('pomodoro-window-closed', prevOnClosedListener)
        }
        prevOnClosedListener = () => callback()
        ipcRenderer.on('pomodoro-window-closed', prevOnClosedListener);
    }
});
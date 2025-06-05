import {} from 'prod-app-shared'
import { PomodoroRendererExports, PomodoroTimerInfo } from '../../../types/Global'
import { contextBridge, ipcRenderer } from 'electron'

declare global {
    interface Window {
        pomodoro: PomodoroRendererExports
    }
}

contextBridge.exposeInMainWorld('pomodoro', {
    createWindow: (fileToLoad: string, options: Electron.BrowserWindowConstructorOptions) : void => {
        ipcRenderer.invoke('createWindow', fileToLoad, options)
    },
    
    onUpdate: (callback: (data: PomodoroTimerInfo) => void) => {
        console.log("i should be getting something!")
        ipcRenderer.on('update-pomodoro', (_event, data) => callback(data))
    },
    
    onClosed: (callback: () => void) => 
        ipcRenderer.on('pomodoro-window-closed', () => callback()),
});
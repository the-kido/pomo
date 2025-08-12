// import {} from 'prod-app-shared'
import { PomodoroRendererExports, PomodoroTimerInfo } from '/src/types/Pomodoro'
import { contextBridge, ipcRenderer } from 'electron'
import { UserData } from '/src/types/UserData';
import { LLMResult } from '/src/main/ai/ollama';

declare global {
    interface Window {
        pomodoro: PomodoroRendererExports,
        app: { 
            onDidFinishLoad: (callback: (data: UserData) => void) => void,
            saveData: (data: UserData) => void,
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

contextBridge.exposeInMainWorld('app', {
    onDidFinishLoad: (callback: (data: UserData) => void) => 
        ipcRenderer.addListener('hydrate-user-data', (_, data: UserData) => callback(data)),
    saveData: (data: UserData) => {
        ipcRenderer.send('save-data', data);
    }
});

contextBridge.exposeInMainWorld('ollama', {
  generateText: (prompt: string) : Promise<LLMResult> => ipcRenderer.invoke('generate', prompt),
});

contextBridge.exposeInMainWorld('states', {
    onOllamaStateChanged: (callback: (isOllamaActive: boolean) => void) => ipcRenderer.addListener('ollama-state-changed', (_, change) => callback(change)),
    onExtensionStateChanged: (callback: (isExtensionConnected: boolean) => void) => ipcRenderer.addListener('extension-state-changed', (_, change) => callback(change))
})
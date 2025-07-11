import { contextBridge, ipcRenderer } from 'electron';
import { PomodoroRendererExports, PomodoroTimerInfo } from '../../../types/Pomodoro';

declare global {
  interface Window {
    pomodoro: PomodoroRendererExports
  }
}

// Exposes functions that the *renderers* can call.
contextBridge.exposeInMainWorld('pomodoro', {
   onInit: (callback: (data: PomodoroTimerInfo) => void) =>
      ipcRenderer.on('init-pomodoro', (_event: any, data: any) => callback(data)),

   attemptClose: (data: PomodoroTimerInfo) =>{
      // "send FROM renderer to main process"
      ipcRenderer.send('closed-pomodoro', data)
   },

   sendUpdate: (data: PomodoroTimerInfo) => {
      ipcRenderer.send('sending-pomo-update', data)
   }
});
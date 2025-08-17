import { app, BrowserWindow, ipcMain } from 'electron';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import '/src/main/data/load'
import '/src/main/ai/ai'
import '/src/main/rpc/discord'
import { useAppStateStore } from '/src/main/states/appStates'

//#region Main Window

// Automagically made by Forge's Webpack plugin
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { readData, writeData } from '/src/main/data/load';
import { UserData } from './types/UserData';
import { mainProcessEvents } from './main/events/events';
import { CHANNELS } from './types/IPC';

if (require('electron-squirrel-startup')) app.quit();

var mainWindow: BrowserWindow;

const createWindow = async (): Promise<void> => {
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
 
  // "hydrating" user data
  const data = await readData();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send(CHANNELS.fromMainProcess.hydrateUserData, data);
  });

  mainWindow.webContents.on('did-frame-finish-load', () => {
    mainWindow.webContents.send(CHANNELS.fromMainProcess.hydrateUserData, data);
  });

  mainProcessEvents.emit('main-window-created', mainWindow)
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  console.log("DONE")
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//#endregion Main Window

//#region Pomodoro Window

declare const POMODORO_TIMER_WEBPACK_ENTRY: string;
declare const POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY: string;

let pomodoro: BrowserWindow | null = null;

ipcMain.handle(CHANNELS.fromMainRenderer.onCreateWindow, (_, timerInfo: PomodoroTimerInfo, options: Electron.BaseWindowConstructorOptions) => {
  
  useAppStateStore.getState().setActivePomodoro(timerInfo)

  pomodoro = new BrowserWindow({
    height: options.height,
    width: options.width,
    webPreferences: {preload: POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY},
    frame: false,
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}), 
    alwaysOnTop: true
  });

  pomodoro.setMinimumSize(275, 200);
  pomodoro.loadURL(POMODORO_TIMER_WEBPACK_ENTRY);

  pomodoro.on('maximize', () => {
    pomodoro.unmaximize();
  });

  // Open the DevTools.
  pomodoro.webContents.openDevTools();

  pomodoro.webContents.on('did-finish-load', () => {
    pomodoro.webContents.send(CHANNELS.fromPomodoroMain.onInit, timerInfo);
  });

  pomodoro.on('close', (event) => {
    useAppStateStore.getState().stopPomodoro()

    event.preventDefault();
    pomodoro.hide();
    mainWindow.webContents.send(CHANNELS.fromPomodoroMain.onClose);
  });
})
  
ipcMain.on(CHANNELS.fromPomodoroRenderer.onClose, () => {
  pomodoro.close();
});

ipcMain.on(CHANNELS.fromPomodoroRenderer.changeWindowSize, (_, x: number, y: number) => {
  pomodoro.setSize(x, y);
  pomodoro.setMinimumSize(x, y);
});

ipcMain.on(CHANNELS.fromPomodoroRenderer.onSaveData, (_, data: UserData) => {
  writeData(data);
});

ipcMain.on(CHANNELS.fromPomodoroRenderer.onSendUpdate, (_, data: PomodoroTimerInfo) => {
  mainWindow.webContents.send(CHANNELS.fromPomodoroMain.onSendUpdate, data);
  mainProcessEvents.emit('pomodoro-updated', data)
});

//#endregion Pomodoro Window
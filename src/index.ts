import { app, BrowserWindow, ipcMain } from 'electron';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import '/src/main/data/load'

//#region Main Window

// Automagically made by Forge's Webpack plugin
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { readData, writeData } from '/src/main/data/load';
import { UserData } from './types/UserData';

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
    mainWindow.webContents.send('hydrate-user-data', data);
  });

  mainWindow.webContents.on('did-frame-finish-load', () => {
    mainWindow.webContents.send('hydrate-user-data', data);
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
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

ipcMain.handle('createWindow', (_, timerInfo: PomodoroTimerInfo, options: Electron.BaseWindowConstructorOptions) => {
  
  pomodoro = new BrowserWindow({
    height: options.height,
    width: options.width,
    webPreferences: {preload: POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY},
    frame: false,
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
    , alwaysOnTop: true
  });

  pomodoro.setMinimumSize(275, 200);
  pomodoro.loadURL(POMODORO_TIMER_WEBPACK_ENTRY);

  // This looks so goofy  
  pomodoro.on('maximize', () => {
    pomodoro.unmaximize();
  });

  // Open the DevTools.
  pomodoro.webContents.openDevTools();

  pomodoro.webContents.on('did-finish-load', () => {
    pomodoro.webContents.send('init-pomodoro', timerInfo);
  });

  pomodoro.on('close', (event) => {
    event.preventDefault();
    pomodoro.hide();
    mainWindow.webContents.send('pomodoro-window-closed');
  });
})
  
ipcMain.on('closed-pomodoro', () => {
  pomodoro.close();
});

ipcMain.on('change-window-size', (_, x: number, y: number) => {
  pomodoro.setSize(x, y);
});

ipcMain.on('save-data', (_, data: UserData) => {
  writeData(data);
});

ipcMain.on('sending-pomo-update', (_, data: PomodoroTimerInfo) => {
  mainWindow.webContents.send('update-pomodoro', data);
});

//#endregion Pomodoro Window
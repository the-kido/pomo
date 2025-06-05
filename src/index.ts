import { app, BrowserWindow, ipcMain } from 'electron';
import { PomodoroTimerInfo } from './types/Pomodoro';

// Automagically made by Forge's Webpack plugin
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

var mainWindow: BrowserWindow;
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
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


/*
MOVE ELSE WHERE
*/

declare const POMODORO_TIMER_WEBPACK_ENTRY: string;
declare const POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY: string;

let pomodoro: BrowserWindow | null = null;

ipcMain.handle('createWindow', (_, timerInfo: PomodoroTimerInfo, options: Electron.BaseWindowConstructorOptions) => {
  // Create the browser window.

   pomodoro = new BrowserWindow({
    height: options.height,
    width: options.width,
    
    webPreferences: {
      preload: POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY, // Your preload.ts
    },
  });

  pomodoro.setMinimumSize( 300, 500) 
  // and load the index.html of the app.
  pomodoro.loadURL(POMODORO_TIMER_WEBPACK_ENTRY);

  // Open the DevTools.
  pomodoro.webContents.openDevTools();

  pomodoro.webContents.on('did-finish-load', () => {
    pomodoro.webContents.send('init-pomodoro', timerInfo);
  });

  pomodoro.on('close', (event) => {
    event.preventDefault()
    pomodoro.hide();
    mainWindow.webContents.send('pomodoro-window-closed');
  });

  ipcMain.on('closed-pomodoro', (_, data: PomodoroTimerInfo) => {
    pomodoro.close()
  });

  ipcMain.on('updated-pomodoro', (_, data: PomodoroTimerInfo) => {
    mainWindow.webContents.send('update-pomodoro', data);
  });
  
  return;
})



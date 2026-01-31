import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import '/src/main/data/load'
import '/src/main/ai/ai'
import '/src/main/rpc/discord'
import { checkForUpdatesManually } from '/src/main/data/auto-updater'
import { useAppStateStore } from '/src/main/states/appStates'

//#region Main Window

// Automagically made by Forge's Webpack plugin
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { readData, writeData } from '/src/main/data/load';
import { UserData } from './types/UserData';
import { mainProcessEvents } from './main/events/events';
import { CHANNELS } from './types/IPC';
import { useUserDataStore, useWorkSessionHistoryStore } from './main/states/userDataStates';
import path from 'path';

if (require('electron-squirrel-startup')) app.quit();

// App name required for notifs
app.name = 'PomoTimer';

var mainWindow: BrowserWindow;

const createWindow = async (): Promise<void> => {
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    autoHideMenuBar: true,
    frame: false,
    icon: path.join(__dirname, './assets/app.ico')
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
 
  // "hydrating" user data
  const data = await readData();
  useUserDataStore.getState().loadUserData(data);
  console.log("Hydrating complete")

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send(CHANNELS.fromMainProcess.hydrateUserData, data);
  });

  // // For debugging
  mainWindow.webContents.on('did-frame-finish-load', () => {
    mainWindow.webContents.send(CHANNELS.fromMainProcess.hydrateUserData, data);
  });

  mainProcessEvents.emit('main-window-created', mainWindow)

  app.setName("testing?")
  if (process.platform === 'win32') {
    app.setAppUserModelId('BAZINGA');
  }
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
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  
});

//#endregion Main Window

//#region Pomodoro Window

declare const POMODORO_TIMER_WEBPACK_ENTRY: string;
declare const POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY: string;

let pomodoro: BrowserWindow | null = null;

ipcMain.on(CHANNELS.fromMainRenderer.onLaunchPomodoroWindow, (_, timerInfo: PomodoroTimerInfo, options: Electron.BaseWindowConstructorOptions) => {
  
  // Update app state
  useAppStateStore.getState().setActivePomodoro(timerInfo)

  // Create window instance
  pomodoro = new BrowserWindow({
    height: options.height,
    width: options.width,
    webPreferences: {preload: POMODORO_TIMER_PRELOAD_WEBPACK_ENTRY},
    frame: false,
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}), 
    alwaysOnTop: true,
    icon: path.join(__dirname, './assets/app.ico')
  });

  pomodoro.setSize(200, 200)
  pomodoro.setMinimumSize(200, 200);
  pomodoro.loadURL(POMODORO_TIMER_WEBPACK_ENTRY);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') pomodoro.webContents.openDevTools();

  // When the window loads, initialize its data
  pomodoro.webContents.on('did-finish-load', () => {
    pomodoro.webContents.send(CHANNELS.fromPomodoroMain.onInit, timerInfo);
  });

  // On close, update state, don't *actually* close it but hide it, and notify main that timer closed
  pomodoro.on('close', (event) => {
    useAppStateStore.getState().stopPomodoro()

    event.preventDefault();
    pomodoro.hide();
    mainWindow.webContents.send(CHANNELS.fromPomodoroMain.onClose);
  });
})

ipcMain.on(CHANNELS.fromMainRenderer.maximizeMain, () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); 
  else mainWindow.maximize();
})

ipcMain.on(CHANNELS.fromMainRenderer.minimizeMain, () => {
  mainWindow.minimize();
});

ipcMain.on(CHANNELS.fromMainRenderer.closeMain, () => {
  mainWindow.close();
});

// Close the pomodoro and notify 
ipcMain.on(CHANNELS.fromPomodoroRenderer.onClose, () => {
  pomodoro.close();
  mainProcessEvents.emit('on-close-pomodoro')
});

// Show notification from pomodoro timer
ipcMain.on(CHANNELS.fromPomodoroRenderer.showNotification, (_, title: string, options?: Electron.NotificationConstructorOptions) => {
  const notification = new Notification({
    title,
    icon: path.join(__dirname, './assets/app.ico'),
    ...options
  });
  notification.show();
});

ipcMain.handle(CHANNELS.fromMainRenderer.getAppVersion, () => {
  return app.getVersion();
})

ipcMain.handle(CHANNELS.fromMainRenderer.checkForUpdates, async () => {
  await checkForUpdatesManually();
})

// Update minimum window size.
ipcMain.on(CHANNELS.fromPomodoroRenderer.changeWindowSize, (_, x: number, y: number, isShrunk: boolean) => {
  // TODO: make magic numbers go bye bye and make it scale with UI scale value when I implement that for the timer
  if (isShrunk) pomodoro.setMinimumSize(175, 125)
  else pomodoro.setMinimumSize(200, 200)
});

/**
 * Central function to safely update specific parts of UserData
 * without overwriting other parts
 */

function updateUserData(partialUpdate: Partial<UserData>, send: boolean = true, from: 'pomo' | 'main') {
  const currentData = useUserDataStore.getState().getUserData();
  
  // Create new object with only the fields that should be updated
  const newData = {
    ...currentData,
    ...partialUpdate,
    // Always ensure workSessionHistory is from its store
    workSessionHistory: useWorkSessionHistoryStore.getState().history
  };
  
  // Update canonical state
  useUserDataStore.getState().loadUserData(newData);
  writeData(newData);
  
  // Notify main window
  console.log("SENDING!")
  
  if (from == 'pomo') mainWindow.webContents.send(CHANNELS.fromMainProcess.onUpdate, newData);
  if (from == 'main' && pomodoro) pomodoro.webContents.send(CHANNELS.fromMainProcess.onUpdate, newData);
}

// Replace your existing handlers with these:

ipcMain.on(CHANNELS.fromMainRenderer.onSaveData, (_, data: Partial<UserData>) => {
  console.log("hi")
  updateUserData(data, false, 'main');
})

ipcMain.on(CHANNELS.fromPomodoroRenderer.onSendPomodoroUpdate, (_, data: PomodoroTimerInfo) => {
  const current = useUserDataStore.getState().getUserData();
  const idx = current.storedPomos.findIndex(pomo => pomo.id === data.id);
  
  const storedPomos = [...current.storedPomos];
  if (idx !== -1) {
    storedPomos[idx] = data;
    updateUserData({ storedPomos }, true, 'pomo');
    mainProcessEvents.emit('pomodoro-updated', data);
  }
});

ipcMain.on(CHANNELS.fromPomodoroRenderer.onIncrementPomosDone, () => {
  console.log("is this activiating?")
  const dayWork = useWorkSessionHistoryStore.getState().getTodaysSession()
  dayWork.pomodorosCompleted += 1;
  useWorkSessionHistoryStore.getState().setTodaysSession(dayWork);

  updateUserData({workSessionHistory: useWorkSessionHistoryStore.getState().history}, true, 'pomo');
})

//#endregion Pomodoro Window
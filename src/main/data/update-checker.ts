import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  console.log("Update available, downloading...");
});

autoUpdater.on('update-downloaded', () => {
  console.log("Update downloaded, will install on quit.");
  autoUpdater.quitAndInstall();
});
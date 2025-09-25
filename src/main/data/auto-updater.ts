import { app, dialog } from 'electron';
import { updateElectronApp, UpdateSourceType } from 'update-electron-app';
import { logger } from '../utils/logger';

let updateInitialized = false;

export function initializeAutoUpdater(): void {
  if (updateInitialized) {
    logger.warn('Auto-updater already initialized');
    return;
  }

  // Only enable auto-updates in production
  if (!app.isPackaged) {
    logger.info('Auto-updater disabled in development mode');
    return;
  }

  try {
    logger.info('Initializing auto-updater...');

    const options = {
      repo: 'the-kido/pomo',
      updateInterval: '10m', // Check for updates every 10 minutes
      logger: {
        log: (message: string) => logger.info(`[Auto-Updater] ${message}`),
        info: (message: string) => logger.info(`[Auto-Updater] ${message}`),
        warn: (message: string) => logger.warn(`[Auto-Updater] ${message}`),
        error: (message: string) => logger.error(`[Auto-Updater] ${message}`)
      },
      notifyUser: true
    };

    updateElectronApp(options);
    updateInitialized = true;
    
    logger.info('Auto-updater initialized successfully');
    
    // Listen for update events
    setupUpdateEventListeners();
    
  } catch (error) {
    logger.error('Failed to initialize auto-updater:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
  }
}

function setupUpdateEventListeners(): void {
  // Note: update-electron-app handles most of the update process automatically,
  // but we can still listen for some events if needed

  app.on('before-quit', (event) => {
    logger.info('App is quitting, ensuring clean shutdown...');
    
    // Give a brief moment for cleanup
    // This helps prevent the port conflict during restart
    if (process.platform === 'win32') {
      // On Windows, give extra time for Squirrel to handle the update
      setTimeout(() => {
        logger.info('Clean shutdown completed');
      }, 100);
    }
  });
}

// Manual update check function for triggering from menu
export async function checkForUpdatesManually(): Promise<void> {
  if (!app.isPackaged) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Development Mode',
      message: 'Auto-updates are disabled in development mode.',
      buttons: ['OK']
    });
    return;
  }

  if (!updateInitialized) {
    logger.warn('Auto-updater not initialized, attempting to initialize...');
    initializeAutoUpdater();
    
    // Give it a moment to initialize
    setTimeout(() => {
      dialog.showMessageBoxSync({
        type: 'info',
        title: 'Update Check',
        message: 'Update check initiated. You will be notified if an update is available.',
        buttons: ['OK']
      });
    }, 1000);
  } else {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Update Check',
      message: 'Auto-updater is running and will notify you when updates are available.',
      buttons: ['OK']
    });
  }
}

// Initialize auto-updater when app is ready
app.on('ready', () => {
  // Delay initialization slightly to ensure the app is fully ready
  setTimeout(() => {
    initializeAutoUpdater();
  }, 2000);
});

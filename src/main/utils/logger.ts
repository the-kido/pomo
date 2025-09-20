import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

class Logger {
  private logPath: string;

  constructor() {
    // Store logs in the user data directory
    const userDataPath = app.getPath('userData');
    this.logPath = path.join(userDataPath, 'app.log');
  }

  private writeLog(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}\n`;
    
    // Write to console (for development)
    console.log(`[${level}] ${message}`, ...args);
    
    // Write to file (for production debugging)
    try {
      fs.appendFileSync(this.logPath, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message: string, ...args: any[]) {
    this.writeLog('INFO', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.writeLog('ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.writeLog('WARN', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.writeLog('DEBUG', message, ...args);
  }

  getLogPath(): string {
    return this.logPath;
  }

  openLogFolder() {
    const { shell } = require('electron');
    shell.showItemInFolder(this.logPath);
  }
}

export const logger = new Logger();
import { EventEmitter } from 'events';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { BrowserWindow } from 'electron';

// Define all possible events and their argument types
export type MainProcessEventMap = {
  'main-window-created': [window: BrowserWindow]; 
  'pomodoro-updated': [pomoInfo: PomodoroTimerInfo];
  
  // For tracking pomodoro state.  
  'app-state-changed-to-menu': []; 
};

export class TypedEventEmitter<T extends Record<string, any[]>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    this.emitter.on(event as string, listener as (...args: any[]) => void);
    return this;
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): boolean {
    return this.emitter.emit(event as string, ...args);
  }
}

export const mainProcessEvents = new TypedEventEmitter<MainProcessEventMap>();
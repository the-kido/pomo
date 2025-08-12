import { create } from 'zustand';

import { PomodoroTimerInfo } from '/src/types/Pomodoro';

// These will be used server-side ONLY

export type AppState = Active | Inactive

export type Active = {
    isActive: true
    timer: PomodoroTimerInfo
}

export type Inactive = {
    isActive: false
}


interface AppStateStore {
    state: AppState;
    setActivePomodoro: (pomodoro: PomodoroTimerInfo) => void;
    stopPomodoro: () => void;
}

export const useAppStateStore = create<AppStateStore>((set) => ({
    state: { isActive: false },
    setActivePomodoro: (pomodoro: PomodoroTimerInfo) => set(() => ({ state: {isActive: true, timer: pomodoro} })),
    stopPomodoro: () => set(() => ({ state: { isActive: false } })),
}));


/*
 * For Extension Activity
 */

export interface ExtensionState {
    isExtensionConnected: boolean;
    setExtensionConnected: (connected: boolean) => void;
}

export const useExtensionStateStore = create<ExtensionState>((set) => ({
    isExtensionConnected: false,
    setExtensionConnected: (connected: boolean) => set({ isExtensionConnected: connected }),
}));

/*
 * For Ollama activity
 */

export interface OllamaState {
    isOllamaActive: boolean;
    setOllamaActive: (active: boolean) => void;
}

export const useOllamaStateStore = create<OllamaState>((set) => ({
    isOllamaActive: false,
    setOllamaActive: (active: boolean) => {
        set({ isOllamaActive: active })
    },
}));
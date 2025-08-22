import { PomodoroRendererExports } from "./IPC";

export enum PomoActivityType { ACTIVE, CHILL, UNKNOWN }

export const PomoActivityTypeDisplay: Record<PomoActivityType, string> = {
  [PomoActivityType.ACTIVE]: "🔥 Active",
  [PomoActivityType.CHILL]: "☕ Chill",
  [PomoActivityType.UNKNOWN]: "❓ Unknown"
};

export const NONE: string = "None"
export const PLEASE_SELECT: string = "Please Select"

export interface PomodoroTimerInfo {
    // Listed in order of what is inputted by the pomodoro creator
    type: PomoActivityType,
    goal?: string,
    task: string,
    motivation: string,
    nextReward: string,
    subtasks: string[],
    subtasksCompletedIndicies: number[],
    startTimeSeconds: number,
    breakTimeSeconds: number,
    received: boolean,
    completed: number,
    timeCreated: number,
}

export const DEFAULT_POMO_TIMER: PomodoroTimerInfo = {
  type: PomoActivityType.UNKNOWN,
  task: '',
  motivation: '',
  nextReward: '',
  subtasks: [],
  subtasksCompletedIndicies: [],
  startTimeSeconds: 25 * 60,
  breakTimeSeconds: 300,
  received: false,
  completed: 0,
  timeCreated: Date.now(),
}

export interface Window {
    pomodoro: PomodoroRendererExports
}

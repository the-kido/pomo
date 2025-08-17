import { PomodoroRendererExports } from "./IPC";

export enum PomoActivityType { ACTIVE, CHILL, UNKNOWN }

export const PomoActivityTypeDisplay: Record<PomoActivityType, string> = {
  [PomoActivityType.ACTIVE]: "🔥 Active",
  [PomoActivityType.CHILL]: "☕ Chill",
  [PomoActivityType.UNKNOWN]: "❓ Unknown"
};

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

export interface Window {
    pomodoro: PomodoroRendererExports
}

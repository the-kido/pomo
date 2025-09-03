import { DayWorkDict, PomodoroTimerInfo } from "./Pomodoro";

export interface UserData {
  user: UserPreferences;
  window: {
    width: number;
    height: number;
  };
  storedPomos: Array<PomodoroTimerInfo>;
  storedCompletedPomos: Array<PomodoroTimerInfo>;
  workSessionHistory: DayWorkDict
}

export interface UserDataStore {
  loadUserData: (data: UserData) => void,
  getUserData: () => UserData,
}

export interface UserPreferences {
  goals: string[],
  rewards: string[],
  breakTime: number,
  longBreakTime: number,
  workTime: number,
  enabledTaskType: boolean,
  enabledTaskRewards: boolean,
  enabledSpecifyMotive: boolean,
  darkMode: boolean,
}
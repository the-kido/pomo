import { PomodoroTimerInfo } from "./Pomodoro";

export interface UserData {
  user: {
    goals: string[],
    rewards: string[],
    breakTime: number,
    longBreakTime: number,
    workTime: number,
  };
  window: {
    width: number;
    height: number;
  };
  storedPomos: Array<PomodoroTimerInfo>;
  storedCompletedPomos: Array<PomodoroTimerInfo>;
}

export interface UserDataStore {
  loadUserData: (data: UserData) => void,
  getUserData: () => UserData,
}
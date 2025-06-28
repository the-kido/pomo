import { PomodoroTimerInfo } from "./Pomodoro";

export interface Data {
  user: {
    name: string;
    isSubscribed: boolean;
  };
  window: {
    width: number;
    height: number;
  };
  storedPomos: Array<PomodoroTimerInfo>;
}
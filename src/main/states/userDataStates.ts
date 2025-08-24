import { create } from 'zustand';
import { UserData, UserDataStore } from '/src/types/UserData';
import { useCompletedPomodorosStore, usePomodorosStore } from '/src/renderer/main/PomodoroList';
import { DayWork, DayWorkDict } from '/src/types/Pomodoro';
import { getYMD } from '../utils/utils';

export const DEFAULT_USERDATA: UserData = {
	user: {
		goals: ["📈 Improve GPA"],
		rewards: ["🚶 Go for a walk"],
		breakTime: 5 * 60,
		longBreakTime: 25 * 60,
		workTime: 25 * 60,
		enabledTaskType: true,
		enabledTaskRewards: true,
		darkMode: false,
	},
	window: {
		width: 0,
		height: 0
	},
	storedPomos: [],
	storedCompletedPomos: [],
	workSessionHistory: {}
}

const SHORT_BREAK_MAYBE_TOO_LONG = 15 * 60;
const LONG_BREAK_MAYBE_TOO_LONG = 30 * 60;
const WORK_MAYBE_TOO_LONG = 35 * 60;

// Fetches and loads user data; individual data is stored in separate, self-contained stores 
export const useUserDataStore = create<UserDataStore>((_, __) => ({
	getUserData: () => {
		var goals = useGoalStore.getState().goals;
		var rewards = useRewardsStore.getState().rewards;
		var breaktime = usePomodoroTimerStore.getState().breakTime;
		var longBreakTime = usePomodoroTimerStore.getState().longBreakTime;
		var workTime = usePomodoroTimerStore.getState().workTime;
		var enabledTaskType = useUserSettingsStore.getState().enabledTaskType;
		var enabledTaskRewards = useUserSettingsStore.getState().enabledTaskRewards;
		var darkMode = useUserSettingsStore.getState().darkMode;
		var length = useWindowSizeStore.getState().height;
		var width = useWindowSizeStore.getState().width;
		var workSessionHistory = useWorkSessionHistoryStore.getState().history

		return {
			user: {
				goals: goals,
				rewards: rewards,
				breakTime: breaktime,
				longBreakTime: longBreakTime,
				workTime: workTime,
				enabledTaskType: enabledTaskType,
				enabledTaskRewards: enabledTaskRewards,
				darkMode: darkMode,
			},
			window: {
				width: width,
				height: length,
			},
			storedPomos: usePomodorosStore.getState().list,
			storedCompletedPomos: useCompletedPomodorosStore.getState().list,
			workSessionHistory: workSessionHistory
		};
	}, loadUserData: (data) => {
		useGoalStore.getState().setGoals([...data.user.goals] );
		useRewardsStore.getState().setRewards([...data.user.rewards]);
		usePomodoroTimerStore.getState().setBreakTime(data.user.breakTime);
		usePomodoroTimerStore.getState().setLongBreakTime(data.user.longBreakTime);
		usePomodoroTimerStore.getState().setWorkTime(data.user.workTime);
		useUserSettingsStore.getState().setEnabledTaskType(data.user.enabledTaskType);
		useUserSettingsStore.getState().setEnabledTaskRewards(data.user.enabledTaskRewards);
		useUserSettingsStore.getState().setUsingDarkMode(data.user.darkMode);
		useWindowSizeStore.getState().setSize(data.window.width, data.window.height);
		usePomodorosStore.getState().setPomodoros([...data.storedPomos]);
		useCompletedPomodorosStore.getState().setPomodoros([...data.storedCompletedPomos])
		useWorkSessionHistoryStore.getState().setHistory(data.workSessionHistory)
	}
}))

interface Goals {
	goals: string[],
	setGoals: (newGoals: string[]) => void,
	addGoal: (goal: string) => "Success" | "Duplicate" | "Unknown",
	removeGoal: (goalToRemove: string) => void,
	clearGoals: () => void,
}

export const useGoalStore = create<Goals>((set, _) => ({
	goals: [
		'Temp',
		'Goals',
		'Practice TypeScript',
	],
	setGoals: (newGoals) => set({ goals: newGoals }),
	addGoal: (goal) => {
		var response: "Success" | "Duplicate" | "Unknown" = "Unknown";

		set((state) => {
			// Check for duplicates before adding
			if (state.goals.includes(goal)) {
				response = 'Duplicate'
				return state; // return state as is
			}
			response = 'Success'
			return { goals: [...state.goals, goal] };
		});
		return response;
	},
	removeGoal: (goalToRemove) => set((state) => ({
		goals: state.goals.filter((goal) => goal !== goalToRemove),
	})),
	clearGoals: () => set({ goals: [] }),
}));

interface Rewards {
	rewards: string[],
	setRewards: (newGoals: string[]) => void,
	addReward: (goal: string) => "Success" | "Duplicate" | "Unknown",
	removeReward: (goalToRemove: string) => void,
	clearRewards: () => void,
}

export const useRewardsStore = create<Rewards>((set, _) => ({
	rewards: [
		'Go for a run',
		'Make a smoothie',
		'Finish a small Todoist task',
		'Respond to messages on Discord',
	],

	setRewards: (newGoals) => set({ rewards: newGoals }),

	addReward: (reward) => {
		var response: "Success" | "Duplicate" | "Unknown" = "Unknown";

		set((state) => {
			// Check for duplicates before adding
			if (state.rewards.includes(reward)) {
				response = 'Duplicate'
				return state; // return state as is
			}

			response = 'Success'
			return { rewards: [...state.rewards, reward] };
		});

		return response;
	},
	removeReward: (goalToRemove) =>
		set((state) => ({
			rewards: state.rewards.filter((goal) => goal !== goalToRemove),
		})),

	clearRewards: () => set({ rewards: [] }),
}));

type SetBreakTimeResults = 'Success' | 'Too Short' | 'Longer Than Long Break' | 'Suggest Too Long';
type SetLongBreakTimeResults = 'Success' | 'Shorter Than Break' | 'Maybe Too Long';
type SetWorkTimeResults = 'Success' | 'Too Short' | 'Suggest Too Long';

interface PomodoroTimerTimes {
	breakTime: number,
	longBreakTime: number,
	workTime: number,
	setBreakTime: (to: number) => SetBreakTimeResults,
	setLongBreakTime: (to: number) => SetLongBreakTimeResults,
	setWorkTime: (to: number) => SetWorkTimeResults,
}

export const usePomodoroTimerStore = create<PomodoroTimerTimes>((set, _) => ({
	breakTime: 5 * 60,
	longBreakTime: 25 * 60,
	workTime: 25 * 60,
	setBreakTime: (to: number) => {
		var result: SetBreakTimeResults;
		set((state) => {
			if (to <= 0) {
				result = 'Too Short';
				return state;
			}
			if (to >= state.longBreakTime) {
				result = 'Longer Than Long Break';
				return state;
			}
			if (to >= SHORT_BREAK_MAYBE_TOO_LONG) {
				result = 'Suggest Too Long';
				return state;
			}

			return { ...state, breakTime: to }
		})

		return result;
	},
	setLongBreakTime(to: number) {
		var result: SetLongBreakTimeResults;
		set((state) => {
			if (to <= state.breakTime ) {
				result = 'Shorter Than Break';
				return state;
			}
			if (to >= LONG_BREAK_MAYBE_TOO_LONG) {
				result = 'Maybe Too Long';
				return state;
			}

			return { ...state, longBreakTime: to }
		})

		return result;
	},
	setWorkTime(to: number) {
		var result: SetWorkTimeResults;
		set((state) => {
			if (to <= 3) {
				result = 'Too Short';
				return state;
			}
			if (to >= WORK_MAYBE_TOO_LONG) {
				result = 'Suggest Too Long';
				return state;
			}
			return { ...state, longBreakTime: to }
		})

		return result;
	},
}));

interface WindowSize {
	width: number,
	height: number,
	setSize: (width: number, height: number) => void,
}

export const useWindowSizeStore = create<WindowSize>((set) => ({
	width: 300,
	height: 500,
	setSize: (width, height) => set({ width: width, height: height }),
}));

interface UserSettings {
	enabledTaskType: boolean;
	enabledTaskRewards: boolean;
	darkMode: boolean,
	setEnabledTaskType: (value: boolean) => void;
	setEnabledTaskRewards: (value: boolean) => void;
	setUsingDarkMode: (value: boolean) => void;
}

export const useUserSettingsStore = create<UserSettings>((set) => ({
	enabledTaskType: true,
	enabledTaskRewards: true,
	darkMode: false,
	setEnabledTaskType: (value) => set({ enabledTaskType: value }),
	setEnabledTaskRewards: (value) => set({ enabledTaskRewards: value }),
	setUsingDarkMode: (value) => set({ darkMode: value })
}));

interface WorkSessionHistory {
	history: DayWorkDict;
	setHistory: (history: DayWorkDict) => void;
	addCompletedTask: (id: string) => void;
	removeCompletedTask: (id: string) => void;
	clearHistory: () => void;
	getTodaysSession: () => DayWork;
	setTodaysSession: (dayWork: DayWork) => void;
}

export const useWorkSessionHistoryStore = create<WorkSessionHistory>((set, get) => ({
	history: {},
	setHistory: (history) => set({ history }),
	addCompletedTask: (id: string) => {
		set((state) => {
			const key = getYMD(new Date());
			const dayWork = state.history[key] || { pomodorosCompleted: 0, tasksCompleted: [] };
			return {
				history: {
					...state.history,
					[key]: {
						...dayWork,
						tasksCompleted: [...dayWork.tasksCompleted, id]
					}
				}
			};
		});
	},
	removeCompletedTask: (id: string) => {
		set((state) => {
			const key = getYMD(new Date());
			const dayWork = state.history[key] || { pomodorosCompleted: 0, tasksCompleted: [] };
			
			if (!dayWork) return state;
			
			return {
				history: {
					...state.history,
					[key]: {
						...dayWork,
						tasksCompleted: dayWork.tasksCompleted.filter(taskId => taskId !== id)
					}
				}
			};
		});
	},
	clearHistory: () => set({ history: {} }),
	getTodaysSession: () => {
		const key = getYMD(new Date());
		const history = get().history;
		return history[key] || { pomodorosCompleted: 0, tasksCompleted: [] };
	},
	setTodaysSession: (dayWork: DayWork) => {
		set((state) => {
			const key = getYMD(new Date());
			return {
				history: {
					...state.history,
					[key]: dayWork
				}
			};
		});
	}
}));
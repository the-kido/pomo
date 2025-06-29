      
import { create } from 'zustand';
import { UserData, UserDataStore } from '/src/types/UserData';
import { usePomodorosStore } from '/src/renderer/main/PomodoroList';

export const NO_SELECTION: string = "None"

export const DEFAULT_USERDATA: UserData = {
    user: {
        goals: ["📈 Improve GPA"],
        rewards: ["🚶 Go for a walk"],
        breakTime: 5 * 60,
        longBreakTime: 25 * 60,
        workTime: 25 * 60,
    },
    window: {
        width: 0,
        height: 0
    },
    storedPomos: []
}

export const useUserDataStore = create<UserDataStore>((_, __) => ({
	getUserData: () => {
		// Return the current user data from the store, or a default if not set
		var goals = useGoalStore.getState().goals;
		var rewards = useRewardsStore.getState().rewards;
		var breaktime = usePomodoroTimerStore.getState().breakTime;
		var longBreakTime = usePomodoroTimerStore.getState().longBreakTime;
		var workTime = usePomodoroTimerStore.getState().workTime;
		var length = useWindowSizeStore.getState().height;
		var width = useWindowSizeStore.getState().width;

		return {
			user: {
				goals: goals,
				rewards: rewards,
				breakTime: breaktime,
				longBreakTime: longBreakTime,
				workTime: workTime,
			},
			window: {
				width: width,
				height: length,
			},
			storedPomos: usePomodorosStore.getState().list,
		};
	}, loadUserData: (data) => {
		useGoalStore.getState().setGoals(["None", ...data.user.goals]);
		useRewardsStore.getState().setRewards(["None", ...data.user.rewards]);
		usePomodoroTimerStore.getState().setBreakTime(data.user.breakTime);
		usePomodoroTimerStore.getState().setLongBreakTime(data.user.longBreakTime);
		usePomodoroTimerStore.getState().setWorkTime(data.user.workTime);
		
		useWindowSizeStore.getState().setSize(data.window.width, data.window.height);
		usePomodorosStore.getState().setPomodoros(data.storedPomos);
	},
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
	})
);

const SHORT_BREAK_MAYBE_TOO_LONG = 15 * 60;
const LONG_BREAK_MAYBE_TOO_LONG = 30 * 60;
const WORK_MAYBE_TOO_LONG = 35 * 60;

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
}))

interface WindowSize {
	width: number,
	height: number,
	setSize: (width: number, height: number) => void,
}
export const useWindowSizeStore = create<WindowSize>((set) => ({
	width: 300,
	height: 500,
	setSize: (width, height) => set({width: width, height: height}),
}))




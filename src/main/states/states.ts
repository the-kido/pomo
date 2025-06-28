      
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Goal {
	goals: string[],
	setGoals: (newGoals: string[]) => void,
	addGoal: (goal: string) => "Success" | "Duplicate" | "Unknown",
	removeGoal: (goalToRemove: string) => void,
	clearGoals: () => void,
}

export const useGoalStore = create<Goal>()(
  devtools(
    persist(
      (set, _) => ({
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
        removeGoal: (goalToRemove) =>
          set((state) => ({
            goals: state.goals.filter((goal) => goal !== goalToRemove),
          })),

        clearGoals: () => set({ goals: [] }),
      }),
      {
        name: 'goals-storage', // Unique name for the local storage item
      }
    )
  )
);

interface Rewards {
	rewards: string[],
	setRewards: (newGoals: string[]) => void,
	addReward: (goal: string) => "Success" | "Duplicate" | "Unknown",
	removeReward: (goalToRemove: string) => void,
	clearRewards: () => void,
}

export const useRewardsStore = create<Rewards>()(
  devtools(
    persist(
      (set, _) => ({
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
      }),
      {
        name: 'goals-storage', // Unique name for the local storage item
      }
    )
  )
);

const SHORT_BREAK_MAYBE_TOO_LONG = 60 * 60;
const LONG_BREAK_MAYBE_TOO_LONG = 60 * 60;

type SetBreakTimeResults = 'Success' | 'Too Short' | 'Longer Than Long Break' | 'Suggest Too Long';
type SetLongBreakTimeResults = 'Success' | 'Shorter Than Break' | 'Maybe Too Long';

interface PomodoroTimerTimes {
	breakTime: number,
	longBreakTime: number,
	setBreakTime: (to: number) => SetBreakTimeResults
	setLongBreakTime: (to: number) => SetLongBreakTimeResults
}
export const usePomodoroTimerStore = create<PomodoroTimerTimes>()(
	devtools(
		persist(
			(set, _) => ({
				breakTime: 5 * 60,
				longBreakTime: 25 * 60,
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
			}),
			{
				name: 'pomodoro-timer-storage'
			}
		)
	)
)
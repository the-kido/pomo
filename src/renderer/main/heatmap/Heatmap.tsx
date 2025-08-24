import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './heatmap.css'
import { useState } from 'react';
import { YMDToFancy } from '/src/main/utils/utils';
import { DayWork, DayWorkDict } from '/src/types/Pomodoro';
 
export function Heatmap({history} : {history: DayWorkDict}){

	const [startDate, setStartDate] = useState<Date>(() => {
		const currentDate = new Date();
		currentDate.setDate(currentDate.getDate() - 40 * 7); 
		return currentDate;
	});
	
	const endDate = new Date(startDate);
	endDate.setDate(startDate.getDate() + 40 * 7); // 52 weeks * 7 days

	return <div
			style={{
				width: "100%",
				maxWidth: "900px", // or any comfy width you want
				overflowX: "auto",
				margin: "0 auto",
			}}
		>
		<div style={{ minWidth: '38rem' }}>
			<CalendarHeatmap
				startDate={startDate}
				endDate={endDate}
				values={Object.entries(history).map(([date, work]) => ({ date, ...work }))}
				classForValue={value => {
					if (!value) return 'color-empty';
					if (value.count >= 5) return 'color-github-4';
					if (value.count >= 3) return 'color-github-3';
					if (value.count >= 1) return 'color-github-2';
					return 'color-github-1';
				}}
				showWeekdayLabels
				showOutOfRangeDays
				titleForValue={value =>{
					var actual = value as unknown as DayWork & {date: string}
					return value && actual.date
					? `${YMDToFancy(actual.date)}\nTasks completed: ${actual.tasksCompleted.length}\nPomos completed: ${actual.pomodorosCompleted}`
					: `No tasks completed`
				}}
			/>
		</div>
	</div>
}
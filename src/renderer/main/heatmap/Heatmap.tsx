import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './heatmap.css'
import { useState } from 'react';
import { YMDToFancy } from '/src/main/utils/utils';
import { useWorkSessionHistoryStore } from '/src/main/states/userDataStates';
 
export function Heatmap(){
	const history = useWorkSessionHistoryStore(store => store.history);

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
				titleForValue={value =>
					value && value.date
					? `${YMDToFancy(value.date)}\nTasks completed: ${value.tasksCompleted}\nPomos completed: ${value.pomosCompleted}`
					: `No tasks completed`
				}
			/>
		</div>
	</div>
}
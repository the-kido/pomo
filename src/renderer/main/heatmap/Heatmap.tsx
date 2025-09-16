import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './heatmap.css'
import { useEffect, useState } from 'react';
import { YMDToFancy } from '/src/main/utils/utils';
import { DayWork, DayWorkDict } from '/src/types/Pomodoro';
 
export function Heatmap({history} : {history: DayWorkDict}){
	const currentYear = new Date().getFullYear();
	const minYear = 2022;

	const [startDate, setStartDate] = useState<Date>(() => new Date(currentYear, 0, 1) );
	
	const [yearShown, setYearShown] = useState<number>(currentYear);
	
	const [endDate, setEndDate] = useState<Date>(
		yearShown === currentYear
			? new Date(new Date().setDate(new Date().getDate() - 1))
			: new Date(yearShown, 11, 31)
	);
 	
	useEffect(() => {
		const start = new Date(yearShown - 1, 11, 30); 
		const end = yearShown === currentYear ? 
			new Date(new Date().setDate(new Date().getDate() - 1)) :  
			new Date(yearShown, 11, 30); 
		
		setStartDate(start);
		setEndDate(end);

	}, [yearShown, currentYear]);
	
	const goToPreviousYear = () => {
		if (yearShown > minYear) {
			setYearShown(yearShown - 1);
		}
	};

	const goToNextYear = () => {
		if (yearShown < currentYear) {
			setYearShown(yearShown + 1);
		}
	};

	return <div
			style={{
				width: "100%",
				overflowX: "auto",
				margin: "0 auto",
			}}
		>
		<div style={{  }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
				<button
					onClick={goToPreviousYear}
					disabled={yearShown <= minYear}
					title='Go back a year'
					>
					←
				</button>
				
				<h2 style={{margin: 0}} >{yearShown}</h2>
				
				<button
					onClick={goToNextYear}
					disabled={yearShown >= currentYear}
					title='Go forward a year'
				>
					→
				</button>
			</div>

			<CalendarHeatmap
				startDate={startDate}
				endDate={endDate}
				values={Object.entries(history).map(([date, work]) => ({ date, ...work }))}
				classForValue={value => {
					console.log(value?.pomodorosCompleted)
					if (!value) return 'color-empty';
					if (value.pomodorosCompleted >= 6) return 'color-github-4'; // 6 and more
					if (value.pomodorosCompleted >= 4) return 'color-github-3'; // 4 or 5
					if (value.pomodorosCompleted >= 2) return 'color-github-2'; // 2 or 3
					if (value.pomodorosCompleted == 1) return 'color-github-1'; // Just 1
					return 'color-empty'; 
				}}
				
				showWeekdayLabels
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
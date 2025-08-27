import '/src/master.css';
import './timer.css'

import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { useUserDataStore } from '/src/main/states/userDataStates';
import { UserData } from '/src/types/UserData';
import Pomodoro from './pomodoro/Pomodoro';

function App() {
  const [timerInfo, setTimerInfo] = useState<PomodoroTimerInfo | 'Unset'>('Unset');

  useEffect(() => {
    window.pomodoro.onInit((receivedData) => {
      setTimerInfo(receivedData);
    });
  }, []);

  useEffect(() => {
		window.pomodoro.onUpdateData((data: UserData) => {
			useUserDataStore.getState().loadUserData(data);
		});
		return () => {
			window.pomodoro.onUnsubUpdateData();
		}
	}, []);

  return timerInfo == 'Unset' ? <div> Loading... </div> : <Pomodoro info={timerInfo} />
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
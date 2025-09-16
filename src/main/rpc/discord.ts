import RPC from 'discord-rpc';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { mainProcessEvents } from '../events/events';

const clientId = '1405193043988189205';

RPC.register(clientId);
const rpc = new RPC.Client({ transport: 'ipc' });

function getMenuPresence() : RPC.Presence {
    return {
        details: 'On menu',
        startTimestamp: new Date(),
        instance: false,
    }
}

mainProcessEvents.on('pomodoro-updated', (pomoInfo: PomodoroTimerInfo) => {
    if (rpc) {
        rpc.setActivity(getPomodoroPresence(pomoInfo));
    }
});

mainProcessEvents.on('on-close-pomodoro', () => {
    if (rpc) {
        rpc.setActivity(getMenuPresence());
    }
})

function getPomodoroPresence(pomoInfo: PomodoroTimerInfo) : RPC.Presence {
    const taskString = `Task: ${pomoInfo.task}`
    const subtaskString = `Subtasks: ${pomoInfo.subtasksCompletedIndicies.length}/${pomoInfo.subtasks.length}`
    const completedString = `🍅 x${pomoInfo.completed}`
    const stateString = pomoInfo.subtasks.length != 0 ? subtaskString + ' — ' + completedString : completedString

    return {
        details: taskString,
        state: stateString,
        startTimestamp: new Date(),
        instance: false,
    }
}

rpc.on('ready', () => {
    rpc.setActivity(getMenuPresence());
    console.log('Rich Presence is active');
});

rpc.login({ clientId }).catch(console.error);


import RPC from 'discord-rpc';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { mainProcessEvents } from '../events/events';

const clientId = '1405193043988189205';

let rpc: RPC.Client | null = null;
let discordRpcEnabled = true;

function startRpc() {
    if (rpc || !discordRpcEnabled) return;

    RPC.register(clientId);
    const client = new RPC.Client({ transport: 'ipc' });
    rpc = client;

    client.on('ready', () => {
        if (rpc !== client || !discordRpcEnabled) return;
        client.setActivity(getMenuPresence());
        console.log('Rich Presence is active');
    });

    client.login({ clientId }).catch((error) => {
        if (rpc === client) rpc = null;
        console.error(error);
    });
}

mainProcessEvents.on('user-data-updated', (data) => {
    discordRpcEnabled = data.user.discordRpcEnabled;
    if (discordRpcEnabled) startRpc();
    else stopRpc();
});

function stopRpc() {
    const client = rpc;
    rpc = null;
    if (client) {
        client.destroy().catch(console.error);
    }
}


function getMenuPresence() : RPC.Presence {
    return {
        details: 'On menu',
        startTimestamp: new Date(),
        instance: false,
    }
}

mainProcessEvents.on('pomodoro-updated', (pomoInfo: PomodoroTimerInfo) => {
    rpc?.setActivity(getPomodoroPresence(pomoInfo));
});

mainProcessEvents.on('on-close-pomodoro', () => {
    rpc?.setActivity(getMenuPresence());
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


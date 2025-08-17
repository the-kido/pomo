import RPC from 'discord-rpc';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { mainProcessEvents } from '../events/events';
import { useUserDataStore } from '../states/userDataStates';

const clientId = '1405193043988189205';

RPC.register(clientId);
const rpc = new RPC.Client({ transport: 'ipc' });

function getMenuActivity() : RPC.Presence {
    return {
        details: 'On menu',
        startTimestamp: new Date(),
        // largeImageKey: 'app_logo',
        // largeImageText: 'MyCoolApp',
        // smallImageKey: 'small_icon',
        instance: false,
    }
}

mainProcessEvents.on('pomodoro-updated', (pomoInfo: PomodoroTimerInfo) => {
    console.log("HI!", pomoInfo)
    if (rpc) {
        rpc.setActivity(getPomodoroActivity(pomoInfo));
    }
});

function getPomodoroActivity(pomoInfo: PomodoroTimerInfo) : RPC.Presence {
    return {
        details: `Task: ${pomoInfo.task}`,
        state: 'Subtasks completed',
        startTimestamp: new Date(),
        // largeImageKey: 'app_logo',
        // largeImageText: 'MyCoolApp',
        // smallImageKey: 'small_icon',
        instance: false,
        // partyId: "101",
        partySize: 2,
        partyMax: 2,
    }
}

rpc.on('ready', () => {
    rpc.setActivity(getMenuActivity());
    console.log('Rich Presence is active');
});

rpc.login({ clientId }).catch(console.error);


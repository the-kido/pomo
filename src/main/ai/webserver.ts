import { WebSocketServer, WebSocket } from 'ws';
import { generate } from './ollama';
import { addUnblockedSite, IsURLUnblocked } from './blocked-sites'
import { Website, MessageType, InboundMessage, EntertainmentPayload } from 'prod-app-shared';
import { useAppStateStore, useExtensionStateStore } from '/src/main/states/appStates';
import { PomodoroTimerInfo } from '/src/types/Pomodoro';
import { PRODUCTIVE, UNPRODUCTIVE } from '/src/types/AI';
import { mainProcessEvents } from '../events/events';
import { CHANNELS } from '/src/types/IPC';

const UNBLOCKED_SITE_DELAY_IN_SECONDS = 60 * 15; 

const getPromptText = (title: string, url: string, currentPomodoro: PomodoroTimerInfo): string => 
  `In one sentence, is "${title}" (${url}) ${PRODUCTIVE} or ${UNPRODUCTIVE} where productivity is relative to the user-set task of "${currentPomodoro.task}"${currentPomodoro.goal != undefined ? ` with the goal to "${currentPomodoro.goal}"` : ""}? Give a 1-sentence reason. Be concise. User intention over anything else.`

const sendMessageToClient = (client : WebSocket, msg : InboundMessage) => {
    if (client.readyState !== WebSocket.OPEN) return; 
    
    // TODO: when do i know when to wrap things in try catches?
    try {
        client.send(JSON.stringify(msg));
    } catch(err) {
        console.warn(err);
    }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject('!!! AI generation timed out'), ms)
        ),
    ]);
}

const handleSiteEntered = async (website : Website) =>
{
    const currentPomo = useAppStateStore.getState().state

    if (!currentPomo.isActive) return;
    
    // This deals with entering a bad "SITE", not a bad app!

    if (IsURLUnblocked(website.url) == true) {
        console.log("This site is unblocked so let's not go there !");
        return;
    }
    console.log(">> Entered site: ", website)


    const generatedOutput = await generate(getPromptText(website.title, website.url, currentPomo.timer));
    
    if (generatedOutput.success == false) {
        if (generatedOutput.type == 'ABORTED') {
            console.log("Sucessfully aborted this generation!")
            return;
        }
        else {
            console.log("TODO: Have an output for this error: ", generatedOutput.type, " and ", generatedOutput.cause)
            return;
        }
    }
    const result = generatedOutput.result;

    console.log(result.productiveOrDistraction);
    // console.log("SITE DESCRIPTIOn:", result.siteContentSummary);
    // console.log(result.reason);
    if (!result.productiveOrDistraction || !result.reason) throw("The LLM did not give and answer or reason")
    
    if (result.productiveOrDistraction == PRODUCTIVE) return;
    
    console.log("Sending for entertainment reasons: ", website.title);
    webSocketServer.clients.forEach((client) => {
            
        const msg: InboundMessage<EntertainmentPayload> = {
            type: MessageType.ENTERED_ENTERTAIMENT,
            payload: {
                website: website,
                reason: result.reason,
            }, 
        }

        sendMessageToClient(client, msg)
    });
}

// "flagged" sites being sites that we thought were not productive
const handleEnterFlaggedSite = (website: Website) => {
    addUnblockedSite(website, UNBLOCKED_SITE_DELAY_IN_SECONDS);
}

// We inject main window 
let mainWindow: Electron.BrowserWindow | null = null;

mainProcessEvents.on('main-window-created', (window) => {
    mainWindow = window;
})

const webSocketServer = new WebSocketServer({ port: 8081 });

webSocketServer.on('connection', (webSocket) => {
    if (mainWindow == null) return;

    useExtensionStateStore.getState().setExtensionConnected(true);
    mainWindow.webContents.send(CHANNELS.fromMainProcess.onExtensionStateChanged, true)

    console.log("WS was connected!");

    webSocket.on('message', (rawData) => {
        const message = rawData.toString();
        var parsedMessage: InboundMessage;
        try {
            parsedMessage = JSON.parse(message);
        }
        catch(e) {
            console.log(e);
            return;
        }
        
        const website: Website = parsedMessage.payload;
        
        switch (parsedMessage.type)
        {
            case MessageType.SITE_ENTERED:
                handleSiteEntered(website);
                break;
            case MessageType.ENTERED_FLAGGED_SITE:
                handleEnterFlaggedSite(website);
                break;
        }
    });

    // Handle client disconnection
    webSocket.on('close', () => {
        console.log('Client disconnected');
        useExtensionStateStore.getState().setExtensionConnected(false);
        mainWindow.webContents.send(CHANNELS.fromMainProcess.onExtensionStateChanged, false)
    });
});
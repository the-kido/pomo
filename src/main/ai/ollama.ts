import { ipcMain } from 'electron';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { useOllamaStateStore } from '/src/main/states/appStates';


import ollama, { ChatRequest } from 'ollama'
import { PRODUCTIVE, UNPRODUCTIVE } from '/src/types/AI';
import { mainProcessEvents } from '../events/events';
const POLL_TIME = 5000; // in milliseconds

const schema = z.object({
    productiveOrDistraction: z.enum([PRODUCTIVE, UNPRODUCTIVE]),
    reason: z.string()
});

export type LLMResult = z.infer<typeof schema>;

const IsOllamaActive = async () => {
    try {
        var models = await ollama.list(); 
    } catch (e) {
        console.log("uh oh bad bad");
        return false;
    }
    
    return models.models.length != 0;
}

interface SuccessResult {
    success: true,
    result: LLMResult
}

interface ErrorResult {
    success: false,
    type: 'OLLAMA_NOT_RUNNING' | 'ABORTED' | 'MISC',
    cause?: string
}

export const generate = async (prompt : string) : Promise<SuccessResult | ErrorResult>  => {
    try {
        var isOllamaActive: boolean = await IsOllamaActive();

        if (!isOllamaActive) {
            return { success: false, type: 'OLLAMA_NOT_RUNNING'}
        }
        
        const messageRequest: ChatRequest & { stream: true } = {
            model: 'gemma3n:e4b',
            messages:[{
                role: 'user',
                content: prompt
            }],
            format: zodToJsonSchema(schema),
            stream: true,
            think: false,
            options: { 
                repeat_penalty: 1.2,
                top_k: 128,
                temperature: 0.7
            }
        };
        
        ollama.abort();
        const chat = await ollama.chat(messageRequest);
        
        let fullResponse = '';
        for await (const chunk of chat) {
            process.stdout.write(chunk.message.content);
            fullResponse += chunk.message.content; // Append to the full response
        }

        const parsedResult = schema.parse(JSON.parse(fullResponse)); // Parse the full response

        return { success: true, result: parsedResult };
    } catch (e) {
        console.log(e)
        return { success: false, type: 'MISC', cause: e }
    }
}

ipcMain.handle('generate', async (_, prompt: string) => generate(prompt));

let mainWindow: Electron.BrowserWindow | null = null;
mainProcessEvents.on('main-window-created', (window) => {
    mainWindow = window;
})

// Poll to check if ollama is on or not.
setInterval(async () => {
    const isActive = await IsOllamaActive();
    useOllamaStateStore.getState().setOllamaActive(isActive)
    if (mainWindow != null) {
        mainWindow.webContents.send('ollama-state-changed', isActive)
    }
}, POLL_TIME); 
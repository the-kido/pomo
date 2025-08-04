import { ipcMain } from 'electron';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import ollama, { ChatRequest } from 'ollama'

const schema = z.object({
    productiveOrDistraction: z.enum(['PRODUCTIVE', 'DISTRACTION']),
    siteContentSummary: z.string(),
    reason: z.string()
});

export type LLMResult = z.infer<typeof schema>;

const IsOllamaActive = async () => {
    try {
        var models = await ollama.list(); 
        console.log(models.models);
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
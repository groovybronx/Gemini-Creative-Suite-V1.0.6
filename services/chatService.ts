import { ai } from './geminiClient';
import { type Content, type Part, type GenerateContentResponse } from "@google/genai";
import { Author, type ChatMessage } from '../types';

const buildContents = (messages: ChatMessage[]): Content[] => {
    return messages
        .filter(msg => msg.parts.some(part => part.type === 'text' || part.type === 'image')) // We only send text and user images to the API
        .map(msg => {
            const parts: Part[] = msg.parts.reduce<Part[]>((acc, part) => {
                if (part.type === 'text') {
                    acc.push({ text: part.text });
                } else if (part.type === 'image') {
                    acc.push({
                        inlineData: {
                            mimeType: part.mimeType,
                            data: part.base64,
                        },
                    });
                }
                return acc;
            }, []);
            return {
                role: msg.author === Author.USER ? 'user' : 'model',
                parts,
            };
        });
};

export const chatService = {
  getChatResponseStream: async function* (messages: ChatMessage[], model: string): AsyncGenerator<GenerateContentResponse> {
    try {
        const contents = buildContents(messages);
        const responseStream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
                systemInstruction: 'You are a helpful and creative AI assistant. Your name is Gemini.',
            }
        });

        for await (const chunk of responseStream) {
            yield chunk;
        }
    } catch (error) {
        console.error("Error getting chat response stream:", error);
        yield {
            text: "Sorry, I encountered an error. Please try again.",
            candidates: [],
        } as unknown as GenerateContentResponse;
    }
  },
};
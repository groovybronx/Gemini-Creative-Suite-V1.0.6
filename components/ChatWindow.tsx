
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatConversation, GeminiChatModel, MessagePart, GenerationEvent } from '../types';
import { Author } from '../types';
import { chatService } from '../services/chatService';
import { imageService } from '../services/imageService';
import { dbService } from '../services/dbService';

import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import ImageGenerationPanel from './chat/ImageGenerationPanel';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

interface ChatWindowProps {
    conversationId: string | null;
    onConversationCreated: (id: string) => void;
    onViewImage: (images: string[], startIndex: number) => void;
    onEditImage: (imageUrl: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onConversationCreated, onViewImage, onEditImage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState<GeminiChatModel>('gemini-2.5-flash');
    const [uploadedImage, setUploadedImage] = useState<{ url: string; base64: string; mimeType: string; } | null>(null);
    const [showGenerationPanel, setShowGenerationPanel] = useState(false);
    const [recalledGeneration, setRecalledGeneration] = useState<{ prompt: string, params: GenerationEvent['parameters'] } | undefined>(undefined);

    const currentConversationIdRef = useRef<string | null>(conversationId);
    const justCreatedId = useRef<string | null>(null);

    useEffect(() => {
        if (conversationId && conversationId === justCreatedId.current) {
            justCreatedId.current = null;
            return;
        }

        currentConversationIdRef.current = conversationId;
        const loadConversation = async () => {
            if (conversationId) {
                const convo = await dbService.getConversation(conversationId);
                if (convo && convo.type === 'chat') {
                    const migratedMessages = convo.messages.map(msg => {
                        if (msg.parts) return msg;
                        // @ts-expect-error handle old format
                        if (typeof msg.content === 'string') {
                            // @ts-expect-error handle old format
                            return { ...msg, parts: [{ type: 'text', text: msg.content }] };
                        }
                        return { ...msg, parts: [{ type: 'text', text: '' }] };
                    });
                    setMessages(migratedMessages as ChatMessage[]);
                    setModel(convo.modelUsed);
                } else {
                    setMessages([]);
                    setModel('gemini-2.5-flash');
                }
            } else {
                setMessages([{
                    id: 'initial',
                    author: Author.MODEL,
                    parts: [{ type: 'text', text: "Hello! I'm Gemini. How can I assist you today? You can ask me anything or generate an image!" }]
                }]);
                setModel('gemini-2.5-flash');
            }
            setInput('');
            setUploadedImage(null);
            setShowGenerationPanel(false);
        };
        loadConversation();
    }, [conversationId]);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setUploadedImage({
                url: URL.createObjectURL(file),
                base64,
                mimeType: file.type
            });
            setShowGenerationPanel(false); // Can't generate and upload at the same time
        }
        if (e.target) e.target.value = '';
    }

    const saveMessage = async (message: ChatMessage) => {
        let convoId = currentConversationIdRef.current;
        if (!convoId) {
            const titleText = (message.parts.find(p => p.type === 'text') as { text: string } | undefined)?.text || 'New Chat';
            convoId = Date.now().toString();

            justCreatedId.current = convoId;

            currentConversationIdRef.current = convoId;
            const newConversation: ChatConversation = {
                id: convoId,
                title: titleText.substring(0, 40) + (titleText.length > 40 ? '...' : ''),
                messages: [message],
                createdAt: Date.now(),
                modelUsed: model,
                isFavorite: false,
                type: 'chat',
            };
            await dbService.addOrUpdateConversation(newConversation);
            onConversationCreated(convoId);
        } else {
            const existingConvo = await dbService.getConversation(convoId);
            if (existingConvo && existingConvo.type === 'chat') {
                existingConvo.messages.push(message);
                await dbService.addOrUpdateConversation(existingConvo);
            }
        }
        return convoId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !uploadedImage || isLoading) return;

        const userParts: MessagePart[] = [];
        if (uploadedImage) {
            userParts.push({ type: 'image', ...uploadedImage });
        }
        if (input.trim()) {
            userParts.push({ type: 'text', text: input });
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            author: Author.USER,
            parts: userParts,
        };

        const currentMessages = messages.filter(m => m.id !== 'initial');
        const updatedMessages = [...currentMessages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setUploadedImage(null);
        setIsLoading(true);

        await saveMessage(userMessage);

        const modelMessageId = (Date.now() + 1).toString();
        const modelMessage: ChatMessage = {
            id: modelMessageId,
            author: Author.MODEL,
            parts: [{ type: 'text', text: '' }],
        };
        setMessages(prev => [...prev, modelMessage]);

        let fullResponse = '';
        for await (const chunk of chatService.getChatResponseStream(updatedMessages, model)) {
            fullResponse += chunk;
            setMessages(prev => prev.map((msg): ChatMessage => msg.id === modelMessageId ? { ...msg, parts: [{ type: 'text', text: fullResponse }] } : msg));
        }

        setIsLoading(false);

        const finalModelMessage: ChatMessage = { ...modelMessage, parts: [{ type: 'text', text: fullResponse }] };
        await saveMessage(finalModelMessage);
    };

    const handleGenerateImage = async (prompt: string, params: GenerationEvent['parameters']) => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setShowGenerationPanel(false);
        setRecalledGeneration(undefined);

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            author: Author.USER,
            parts: [{ type: 'text', text: `Generate image: "${prompt}"` }]
        };

        setMessages(prev => [...prev.filter(m => m.id !== 'initial'), userMessage]);
        await saveMessage(userMessage);

        const result = await imageService.generateImage(prompt, params);

        if (result) {
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                author: Author.MODEL,
                parts: [{
                    type: 'imageGenerationResult',
                    images: result.map(url => ({ url })),
                    prompt: prompt,
                    parameters: params,
                }]
            };
            setMessages(prev => [...prev, modelMessage]);
            await saveMessage(modelMessage);
        } else {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                author: Author.MODEL,
                parts: [{ type: 'text', text: "Sorry, I failed to generate the image. Please try again." }]
            };
            setMessages(prev => [...prev, errorMessage]);
            await saveMessage(errorMessage);
        }

        setIsLoading(false);
    };

    const handleRecallGeneration = (prompt: string, params: GenerationEvent['parameters']) => {
        setRecalledGeneration({ prompt, params });
        setShowGenerationPanel(true);
        setUploadedImage(null);
    };
    
    const handleShowGenerationPanel = () => {
        setShowGenerationPanel(true);
        setRecalledGeneration(undefined);
        setUploadedImage(null);
    }
    
    const handleCancelGeneration = () => {
        setShowGenerationPanel(false);
        setRecalledGeneration(undefined);
    }

    return (
        <div className="flex flex-col h-full bg-component-bg rounded-lg overflow-hidden border border-border-color">
            <ChatHeader
                model={model}
                setModel={setModel}
                disabled={messages.length > 1 && messages.some(m => m.id !== 'initial') || showGenerationPanel}
            />
            <MessageList
                messages={messages}
                isLoading={isLoading}
                onViewImage={onViewImage}
                onEditImage={onEditImage}
                onRecallGeneration={handleRecallGeneration}
            />
            <div className="p-4 border-t border-border-color">
                {showGenerationPanel ? (
                    <ImageGenerationPanel
                        onGenerateImage={handleGenerateImage}
                        onCancel={handleCancelGeneration}
                        isLoading={isLoading}
                        initialState={recalledGeneration}
                    />
                ) : (
                    <ChatInput
                        input={input}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        handleFileChange={handleFileChange}
                        onShowGenerationPanel={handleShowGenerationPanel}
                        uploadedImage={uploadedImage}
                        clearUploadedImage={() => setUploadedImage(null)}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatWindow;


import React, { useRef, useEffect } from 'react';
import type { ChatMessage, GenerationEvent } from '../../types';
import SpinnerIcon from '../icons/SpinnerIcon';
import Message from './Message';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onViewImage: (images: string[], startIndex: number) => void;
    onEditImage: (imageUrl: string) => void;
    onRecallGeneration: (prompt: string, params: GenerationEvent['parameters']) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onViewImage, onEditImage, onRecallGeneration }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
                <Message
                    key={msg.id}
                    message={msg}
                    onViewImage={onViewImage}
                    onEditImage={onEditImage}
                    onRecallGeneration={onRecallGeneration}
                />
            ))}
            {isLoading && (
                <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-khaki flex-shrink-0"></div>
                    <div className="bg-base-bg text-text-primary p-3 rounded-lg">
                        <SpinnerIcon className="w-5 h-5 text-accent-yellow" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;


import React from 'react';
import { Author, type ChatMessage, type MessagePart, type GenerationEvent } from '../../types';
import ImageGenerationResult from './ImageGenerationResult';
import TokenCount from '../TokenCount';

interface MessageProps {
    message: ChatMessage;
    onViewImage: (images: string[], startIndex: number) => void;
    onEditImage: (imageUrl: string) => void;
    onRecallGeneration: (prompt: string, params: GenerationEvent['parameters']) => void;
}

const Message: React.FC<MessageProps> = ({ message, onViewImage, onEditImage, onRecallGeneration }) => {

    const renderMessagePart = (part: MessagePart, index: number) => {
        switch (part.type) {
            case 'text':
                return <p key={index} className="whitespace-pre-wrap">{part.text}</p>
            case 'image':
                return <img key={index} src={part.url} alt="User upload" className="max-w-xs rounded-lg mt-2 cursor-pointer" onClick={() => onViewImage([part.url], 0)} />
            case 'imageGenerationResult':
                return <ImageGenerationResult key={index} part={part} onViewImage={onViewImage} onEditImage={onEditImage} onRecallGeneration={onRecallGeneration} />;
            default:
                return null;
        }
    }
    
    const isUser = message.author === Author.USER;

    return (
        <div
            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-accent-khaki flex-shrink-0"></div>
            )}

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-xl p-3 rounded-lg shadow-md ${
                    isUser ? 'bg-accent-yellow text-gray-900' : 'bg-base-bg text-text-primary'
                }`}>
                    {message.parts.map(renderMessagePart)}
                </div>
                {!isUser && message.usageMetadata && (
                    <TokenCount metadata={message.usageMetadata} className="mt-1" />
                )}
            </div>
        </div>
    );
};

export default Message;
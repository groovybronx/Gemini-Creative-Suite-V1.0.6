
import React from 'react';
import { Author, type ChatMessage, type MessagePart, type GenerationEvent } from '../../types';
import ImageGenerationResult from './ImageGenerationResult';

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

    return (
        <div
            className={`flex gap-3 ${message.author === Author.USER ? 'justify-end' : 'justify-start'
                }`}
        >
            {message.author === Author.MODEL && (
                <div className="w-8 h-8 rounded-full bg-accent-khaki flex-shrink-0"></div>
            )}

            {message.author === Author.USER ? (
                <div className="relative group">
                    <div className="max-w-xl p-3 rounded-lg shadow-md bg-accent-yellow text-gray-900">
                        {message.parts.map(renderMessagePart)}
                    </div>
                </div>
            ) : (
                <div className="max-w-xl p-3 rounded-lg shadow-md bg-base-bg text-text-primary">
                    {message.parts.map(renderMessagePart)}
                </div>
            )}
        </div>
    );
};

export default Message;

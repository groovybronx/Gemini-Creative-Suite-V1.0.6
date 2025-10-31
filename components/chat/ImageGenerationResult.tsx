
import React from 'react';
import type { ImageGenerationResultPart, GenerationEvent } from '../../types';
import RecallIcon from '../icons/RecallIcon';
import EditIcon from '../icons/EditIcon';

interface ImageGenerationResultProps {
    part: ImageGenerationResultPart;
    onViewImage: (images: string[], startIndex: number) => void;
    onEditImage: (imageUrl: string) => void;
    onRecallGeneration: (prompt: string, params: GenerationEvent['parameters']) => void;
}

const ImageGenerationResult: React.FC<ImageGenerationResultProps> = ({ part, onViewImage, onEditImage, onRecallGeneration }) => {
    const imageUrls = part.images.map(i => i.url);

    return (
        <div className="flex flex-col gap-2 mt-2">
            {part.prompt && part.parameters && (
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-secondary text-sm">Prompt: <span className="text-text-primary italic">"{part.prompt}"</span></p>
                    <button
                        onClick={() => onRecallGeneration(part.prompt, part.parameters)}
                        className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-border-color"
                        aria-label="Recall this prompt and its settings"
                        title="Recall this prompt and its settings"
                    >
                        <RecallIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                {part.images.map((image, imgIndex) => (
                    <div key={imgIndex} className="relative group aspect-square">
                        <img src={image.url} alt={`Generated image ${imgIndex + 1}`} className="w-full h-full object-contain rounded-md bg-base-bg cursor-pointer" onClick={() => onViewImage(imageUrls, imgIndex)} />
                        <div
                            onClick={() => onViewImage(imageUrls, imgIndex)}
                            className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditImage(image.url);
                                }}
                                className="text-white font-semibold hover:underline flex items-center gap-1"
                            >
                                <EditIcon className="w-4 h-4" /> Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGenerationResult;

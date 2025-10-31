
import React from 'react';
import type { GenerationEvent } from '../../types';
import RecallIcon from '../icons/RecallIcon';
import GeneratedImage from './GeneratedImage';

interface GenerationEventDisplayProps {
  event: GenerationEvent;
  gridCols: number;
  onViewImage: (url: string) => void;
  onEditImage: (imageUrl: string) => void;
  onRecallPrompt: (event: GenerationEvent) => void;
}

const GenerationEventDisplay: React.FC<GenerationEventDisplayProps> = ({ event, gridCols, onViewImage, onEditImage, onRecallPrompt }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-semibold text-text-secondary">Prompt: <span className="text-text-primary italic">"{event.prompt}"</span></p>
        <button
          onClick={() => onRecallPrompt(event)}
          className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-border-color"
          aria-label="Recall this prompt and its settings"
          title="Recall this prompt and its settings"
        >
          <RecallIcon className="w-4 h-4" />
        </button>
      </div>
      <div className={`grid grid-cols-${gridCols} gap-4`}>
        {event.generatedImages.map((image, imgIndex) => (
          <GeneratedImage
            key={imgIndex}
            image={image}
            onViewImage={onViewImage}
            onEditImage={onEditImage}
          />
        ))}
      </div>
    </div>
  );
};

export default GenerationEventDisplay;

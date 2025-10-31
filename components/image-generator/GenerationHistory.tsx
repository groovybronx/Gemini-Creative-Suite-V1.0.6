
import React, { useRef, useEffect } from 'react';
import type { GenerationEvent } from '../../types';
import SpinnerIcon from '../icons/SpinnerIcon';
import GenerationEventDisplay from './GenerationEventDisplay';

interface GenerationHistoryProps {
  history: GenerationEvent[];
  gridCols: number;
  isLoading: boolean;
  error: string | null;
  onViewImage: (url: string) => void;
  onEditImage: (imageUrl: string) => void;
  onRecallPrompt: (event: GenerationEvent) => void;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ history, gridCols, isLoading, error, onViewImage, onEditImage, onRecallPrompt }) => {
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex-grow w-full h-full space-y-6">
      {history.map((event, eventIndex) => (
        <React.Fragment key={event.timestamp}>
          <GenerationEventDisplay
            event={event}
            gridCols={gridCols}
            onViewImage={onViewImage}
            onEditImage={onEditImage}
            onRecallPrompt={onRecallPrompt}
          />
          {eventIndex < history.length - 1 && <hr className="my-6 border-border-color" />}
        </React.Fragment>
      ))}
      {isLoading && <div className="flex justify-center pt-10"><SpinnerIcon className="w-12 h-12 text-accent-yellow" /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}
      {!isLoading && history.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-text-secondary text-center">Your generated images will appear here.</p>
        </div>
      )}
      <div ref={resultsEndRef} />
    </div>
  );
};

export default GenerationHistory;


import React from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

interface GeneratorHeaderProps {
  gridCols: number;
  setGridCols: (cols: number) => void;
  isSettingsPanelOpen: boolean;
  setIsSettingsPanelOpen: (isOpen: boolean) => void;
}

const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({ gridCols, setGridCols, isSettingsPanelOpen, setIsSettingsPanelOpen }) => {
  return (
    <div className="flex justify-between items-center flex-shrink-0">
      <h2 className="text-2xl font-bold text-accent-yellow">Generate Image with Imagen</h2>
      <div className="flex items-center gap-3">
        <label htmlFor="size-slider" className="text-sm font-semibold text-text-secondary">Image Size:</label>
        <input
          id="size-slider"
          type="range"
          min="1"
          max="4"
          step="1"
          value={gridCols}
          onChange={e => setGridCols(Number(e.target.value))}
          className="w-24 cursor-pointer"
        />
        <button
          onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
          className="bg-base-bg p-2 rounded-lg border border-border-color hover:bg-border-color transition-colors"
          aria-label={isSettingsPanelOpen ? 'Hide settings panel' : 'Show settings panel'}
          title={isSettingsPanelOpen ? 'Hide settings panel' : 'Show settings panel'}
        >
          {isSettingsPanelOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default GeneratorHeader;

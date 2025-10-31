
import React, { useState } from 'react';
import type { AspectRatio, ImagenModel } from '../../types';

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const imagenModels: ImagenModel[] = ['imagen-3.0-generate-002', 'imagen-4.0-generate-001', 'imagen-4.0-ultra-generate-001', 'imagen-4.0-fast-generate-001'];

interface SettingsPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  
  prompt: string;
  setPrompt: (p: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  model: ImagenModel;
  setModel: (m: ImagenModel) => void;
  numberOfImages: number;
  setNumberOfImages: (n: number) => void;
  outputMimeType: 'image/jpeg' | 'image/png';
  setOutputMimeType: (mime: 'image/jpeg' | 'image/png') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  const {
    isOpen, isLoading, onSubmit,
    prompt, setPrompt, aspectRatio, setAspectRatio, model, setModel,
    numberOfImages, setNumberOfImages, outputMimeType, setOutputMimeType
  } = props;
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={`flex-shrink-0 bg-base-bg border-l border-border-color transition-all duration-300 ease-in-out ${isOpen ? 'w-96' : 'w-0'} overflow-hidden`}>
      <div className="p-6 h-full overflow-y-auto w-96">
        <h3 className="text-xl font-bold text-accent-yellow mb-4">Settings</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 h-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic city skyline at sunset, cinematic lighting"
            className="w-full h-32 bg-component-bg border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="model-select" className="font-semibold text-text-secondary text-sm">Model:</label>
              <select id="model-select" value={model} onChange={e => setModel(e.target.value as ImagenModel)} className="w-full mt-1 bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" disabled={isLoading}>
                {imagenModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="aspect-ratio" className="font-semibold text-text-secondary text-sm">Aspect Ratio:</label>
              <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full mt-1 bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" disabled={isLoading}>
                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="num-images" className="font-semibold text-text-secondary text-sm">Number of Images:</label>
              <input id="num-images" type="number" min="1" max="4" value={numberOfImages} onChange={e => setNumberOfImages(parseInt(e.target.value, 10))} className="w-full mt-1 bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" disabled={isLoading} />
            </div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-semibold text-accent-yellow hover:underline">
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
            {showAdvanced && (
              <div className="mt-3 flex flex-col gap-4 border border-border-color bg-component-bg p-4 rounded-lg">
                <div>
                  <label htmlFor="output-mime" className="font-semibold text-text-secondary text-sm">File Type:</label>
                  <select id="output-mime" value={outputMimeType} onChange={e => setOutputMimeType(e.target.value as 'image/jpeg' | 'image/png')} className="w-full mt-1 bg-base-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" disabled={isLoading}>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <button
              type="submit"
              className="w-full bg-accent-khaki text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 hover:bg-opacity-90 transition-colors"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;

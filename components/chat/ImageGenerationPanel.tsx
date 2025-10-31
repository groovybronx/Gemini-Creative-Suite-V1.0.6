
import React, { useState, useEffect } from 'react';
import type { AspectRatio, ImagenModel, GenerationEvent } from '../../types';

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const imagenModels: ImagenModel[] = ['imagen-3.0-generate-002', 'imagen-4.0-generate-001', 'imagen-4.0-ultra-generate-001', 'imagen-4.0-fast-generate-001'];

const imagenModelDisplayNames: Record<ImagenModel, string> = {
    'imagen-3.0-generate-002': 'Imagen 3.0',
    'imagen-4.0-generate-001': 'Imagen 4.0',
    'imagen-4.0-ultra-generate-001': 'Imagen 4.0 Ultra',
    'imagen-4.0-fast-generate-001': 'Imagen 4.0 Fast',
};

interface ImageGenerationPanelProps {
  onGenerateImage: (prompt: string, params: GenerationEvent['parameters']) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialState?: {
      prompt: string;
      params: GenerationEvent['parameters'];
  }
}

const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ onGenerateImage, onCancel, isLoading, initialState }) => {
  const [genPrompt, setGenPrompt] = useState(initialState?.prompt || '');
  const [genAspectRatio, setGenAspectRatio] = useState<AspectRatio>(initialState?.params.aspectRatio || '3:4');
  const [genModel, setGenModel] = useState<ImagenModel>(initialState?.params.model || 'imagen-3.0-generate-002');
  const [genNumImages, setGenNumImages] = useState(initialState?.params.numberOfImages || 4);

  useEffect(() => {
    if (initialState) {
        setGenPrompt(initialState.prompt);
        setGenAspectRatio(initialState.params.aspectRatio);
        setGenModel(initialState.params.model);
        setGenNumImages(initialState.params.numberOfImages);
    }
  }, [initialState]);


  const handleGenerate = () => {
    const params: GenerationEvent['parameters'] = {
        model: genModel,
        aspectRatio: genAspectRatio,
        numberOfImages: genNumImages
    };
    onGenerateImage(genPrompt, params);
  }

  return (
    <div className="bg-base-bg p-4 rounded-lg border border-border-color">
      <h3 className="font-semibold text-accent-yellow mb-3">Image Generation</h3>
      <div className="space-y-3">
        <textarea value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder="A futuristic city skyline..." className="w-full h-20 bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" />
        <div className="grid grid-cols-3 gap-2">
          <select value={genModel} onChange={e => setGenModel(e.target.value as ImagenModel)} className="w-full bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow">
            {imagenModels.map(m => <option key={m} value={m}>{imagenModelDisplayNames[m]}</option>)}
          </select>
          <select value={genAspectRatio} onChange={e => setGenAspectRatio(e.target.value as AspectRatio)} className="w-full bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow">
            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
          </select>
          <input type="number" min="1" max="4" value={genNumImages} onChange={e => setGenNumImages(parseInt(e.target.value, 10))} className="w-full bg-component-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={!genPrompt.trim() || isLoading} className="flex-1 bg-accent-khaki text-white rounded-lg p-2 disabled:opacity-50 hover:bg-opacity-90 transition-colors">Generate</button>
          <button onClick={onCancel} className="bg-border-color text-text-primary rounded-lg p-2 hover:bg-opacity-80 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPanel;

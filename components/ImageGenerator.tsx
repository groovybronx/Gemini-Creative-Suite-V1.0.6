
import React, { useState, useEffect, useRef } from 'react';
import { imageService } from '../services/imageService';
import { dbService } from '../services/dbService';
import type { AspectRatio, ImagenModel, ImageGenerationConversation, GenerationEvent } from '../types';

import GeneratorHeader from './image-generator/GeneratorHeader';
import GenerationHistory from './image-generator/GenerationHistory';
import SettingsPanel from './image-generator/SettingsPanel';

interface ImageGeneratorProps {
    conversationId: string | null;
    onSessionCreated: (id: string) => void;
    onViewImage: (url: string) => void;
    onEditImage: (imageUrl: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ conversationId, onSessionCreated, onViewImage, onEditImage }) => {
    // UI State
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(true);
    const [gridCols, setGridCols] = useState(2);
    
    // Form State (lifted up for controlled components)
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
    const [model, setModel] = useState<ImagenModel>('imagen-3.0-generate-002');
    const [numberOfImages, setNumberOfImages] = useState(4);
    const [outputMimeType, setOutputMimeType] = useState<'image/jpeg' | 'image/png'>('image/png');

    // Data State
    const [history, setHistory] = useState<GenerationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const currentConversationIdRef = useRef<string | null>(conversationId);
    
    const resetFormToDefaults = () => {
        setPrompt('');
        setAspectRatio('3:4');
        setModel('imagen-3.0-generate-002');
        setNumberOfImages(4);
        setOutputMimeType('image/png');
    }

    useEffect(() => {
        currentConversationIdRef.current = conversationId;
        const loadConversation = async () => {
            if (conversationId) {
                const convo = await dbService.getConversation(conversationId);
                if (convo && convo.type === 'imageGeneration') {
                    setHistory(convo.history);
                    setPrompt(''); 
                    setError(null);
                }
            } else {
                resetFormToDefaults();
                setHistory([]);
                setError(null);
            }
        };
        loadConversation();
    }, [conversationId]);

    const handleRecallPrompt = (event: GenerationEvent) => {
        setPrompt(event.prompt);
        const p = event.parameters;
        setAspectRatio(p.aspectRatio);
        setModel(p.model);
        setNumberOfImages(p.numberOfImages);
        setOutputMimeType(p.outputMimeType || 'image/png');
        setIsSettingsPanelOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        
        const params: GenerationEvent['parameters'] = {
            model,
            aspectRatio,
            numberOfImages,
            outputMimeType,
        };

        const result = await imageService.generateImage(prompt, params);

        if (result) {
            // Fix: The result from `generateImage` is an object with an `images` property.
            // Also, `usageMetadata` is not provided by this endpoint.
            const newEvent: GenerationEvent = {
                prompt,
                parameters: params,
                generatedImages: result.images,
                timestamp: Date.now()
            };
            
            setHistory(prev => [...prev, newEvent]);
            setPrompt('');

            let convoId = currentConversationIdRef.current;
            if (!convoId) {
                convoId = Date.now().toString();
                currentConversationIdRef.current = convoId;
                const newConversation: ImageGenerationConversation = {
                    id: convoId,
                    title: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''),
                    createdAt: Date.now(),
                    isFavorite: false,
                    type: 'imageGeneration',
                    history: [newEvent]
                };
                await dbService.addOrUpdateConversation(newConversation);
                onSessionCreated(convoId);
            } else {
                const existingConvo = await dbService.getConversation(convoId);
                if (existingConvo && existingConvo.type === 'imageGeneration') {
                    existingConvo.history.push(newEvent);
                    await dbService.addOrUpdateConversation(existingConvo);
                }
            }
        } else {
            setError('Failed to generate image. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-component-bg rounded-lg border border-border-color h-full flex overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
                <GeneratorHeader
                    gridCols={gridCols}
                    setGridCols={setGridCols}
                    isSettingsPanelOpen={isSettingsPanelOpen}
                    setIsSettingsPanelOpen={setIsSettingsPanelOpen}
                />
                <GenerationHistory
                    history={history}
                    gridCols={gridCols}
                    isLoading={isLoading}
                    error={error}
                    onViewImage={onViewImage}
                    onEditImage={onEditImage}
                    onRecallPrompt={handleRecallPrompt}
                />
            </div>

            {/* Retractable Settings Panel */}
            <SettingsPanel
                isOpen={isSettingsPanelOpen}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                prompt={prompt}
                setPrompt={setPrompt}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                model={model}
                setModel={setModel}
                numberOfImages={numberOfImages}
                setNumberOfImages={setNumberOfImages}
                outputMimeType={outputMimeType}
                setOutputMimeType={setOutputMimeType}
            />
        </div>
    );
};

export default ImageGenerator;
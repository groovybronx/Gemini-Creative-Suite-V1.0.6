
import React, { useRef } from 'react';
import PaperclipIcon from '../icons/PaperclipIcon';
import SparklesIcon from '../icons/SparklesIcon';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onShowGenerationPanel: () => void;
    uploadedImage: { url: string } | null;
    clearUploadedImage: () => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    handleSubmit,
    handleFileChange,
    onShowGenerationPanel,
    uploadedImage,
    clearUploadedImage,
    isLoading
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            {uploadedImage && (
                <div className="relative mb-2 w-24 h-24">
                    <img src={uploadedImage.url} alt="upload preview" className="w-full h-full object-cover rounded-lg" />
                    <button onClick={clearUploadedImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-border-color transition-colors" aria-label="Attach file"><PaperclipIcon /></button>
                <button type="button" onClick={onShowGenerationPanel} className="p-2 rounded-full hover:bg-border-color transition-colors" aria-label="Generate image"><SparklesIcon /></button>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-base-bg border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-accent-khaki text-white rounded-full p-2 disabled:opacity-50 hover:bg-opacity-90 transition-colors"
                    disabled={isLoading || (!input.trim() && !uploadedImage)}
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </>
    )
}

export default ChatInput;

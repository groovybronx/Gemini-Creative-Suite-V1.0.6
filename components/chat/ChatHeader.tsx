
import React from 'react';
import type { GeminiChatModel } from '../../types';

interface ChatHeaderProps {
  model: GeminiChatModel;
  setModel: (model: GeminiChatModel) => void;
  disabled: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ model, setModel, disabled }) => (
  <div className="p-4 border-b border-border-color flex items-center gap-4">
    <label htmlFor="model-select" className="font-semibold text-text-secondary">Model:</label>
    <select
      id="model-select"
      value={model}
      onChange={e => setModel(e.target.value as GeminiChatModel)}
      disabled={disabled}
      className="bg-base-bg border border-border-color rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent-yellow disabled:opacity-70"
    >
      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
    </select>
  </div>
);

export default ChatHeader;

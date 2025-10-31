
import React from 'react';
import type { UsageMetadata } from '../types';

interface TokenCountProps {
  metadata: UsageMetadata;
  className?: string;
}

const TokenCount: React.FC<TokenCountProps> = ({ metadata, className }) => {
  // Fix: Check if totalTokenCount is a number to handle cases where it might be 0 or undefined.
  if (!metadata || typeof metadata.totalTokenCount !== 'number') {
    return null;
  }

  return (
    <div className={`relative group flex items-center text-xs ${className}`}>
      <span className="text-text-primary">Tokens: {metadata.totalTokenCount}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute top-full mt-2 w-max p-2 bg-base-bg border border-border-color text-text-primary rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-xs left-0">
        {/* Fix: Conditionally render token counts to avoid showing undefined values. */}
        {typeof metadata.promptTokenCount === 'number' && <p><strong>Prompt:</strong> {metadata.promptTokenCount} tokens</p>}
        {typeof metadata.candidatesTokenCount === 'number' && <p><strong>Response:</strong> {metadata.candidatesTokenCount} tokens</p>}
        <p><strong>Total:</strong> {metadata.totalTokenCount} tokens</p>
      </div>
    </div>
  );
};

export default TokenCount;

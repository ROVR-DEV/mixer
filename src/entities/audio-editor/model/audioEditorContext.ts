'use client';

import { createContext, useContext } from 'react';

import { AudioEditor } from './audioEditor';

export const AudioEditorContext = createContext<AudioEditor | null>(null);

export const useAudioEditor = () => {
  const context = useContext(AudioEditorContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with AudioEditorContext',
    );
  }
  return context;
};

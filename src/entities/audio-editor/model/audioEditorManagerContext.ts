'use client';

import { createContext, useContext } from 'react';

import { AudioEditorManager } from './audioEditorManager';

export const AudioEditorManagerContext =
  createContext<AudioEditorManager | null>(null);

export const useAudioEditorManager = () => {
  const context = useContext(AudioEditorManagerContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with AudioEditorManagerContextProvider',
    );
  }
  return context;
};

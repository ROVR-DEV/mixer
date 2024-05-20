import { createContext, useContext } from 'react';

import { AudioEditorTimelineState } from './audioEditorTimelineState';

export const AudioEditorTimelineStateContext =
  createContext<AudioEditorTimelineState | null>(null);

export const useAudioEditorTimelineState = () => {
  const context = useContext(AudioEditorTimelineStateContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with AudioEditorTimelineStateProvider',
    );
  }
  return context;
};

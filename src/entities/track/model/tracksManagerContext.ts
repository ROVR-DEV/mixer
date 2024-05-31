'use client';

import { createContext, useContext } from 'react';

import { TracksManager } from './tracksManager';

export const TracksManagerContext = createContext<TracksManager | null>(null);

export const useTracksManager = () => {
  const context = useContext(TracksManagerContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with AudioEditorTimelineStateProvider',
    );
  }
  return context;
};

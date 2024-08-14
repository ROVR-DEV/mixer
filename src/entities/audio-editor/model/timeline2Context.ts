'use client';

import { createContext, useContext } from 'react';

import { Timeline2 } from './timeline2';

export const Timeline2Context = createContext<Timeline2 | null>(null);

export const useTimeline2 = () => {
  const context = useContext(Timeline2Context);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with TimelineControllerContextProvider',
    );
  }
  return context;
};

'use client';

import { createContext, useContext } from 'react';

import { Timeline } from './timeline';

export const TimelineContext = createContext<Timeline | null>(null);

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with TimelineControllerContextProvider',
    );
  }
  return context;
};

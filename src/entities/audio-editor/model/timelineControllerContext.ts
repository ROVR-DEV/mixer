'use client';

import { createContext, useContext } from 'react';

import { Timeline } from './timeline';

export const TimelineControllerContext = createContext<Timeline | null>(null);

export const useTimelineController = () => {
  const context = useContext(TimelineControllerContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with TimelineControllerContextProvider',
    );
  }
  return context;
};

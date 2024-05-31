'use client';

import { createContext, useContext } from 'react';

import { TimelineController } from './timelineController';

export const TimelineControllerContext =
  createContext<TimelineController | null>(null);

export const useTimelineController = () => {
  const context = useContext(TimelineControllerContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with AudioEditorTimelineStateProvider',
    );
  }
  return context;
};

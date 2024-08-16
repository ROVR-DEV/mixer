import { RefObject } from 'react';

export interface TimelineScrollProps extends React.ComponentProps<'div'> {
  timelineScrollWidth: number;
  scrollDivRef: RefObject<TimelineScrollDivRef>;
  onChange?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface TimelineScrollDivRef {
  setScroll: (value: number) => void;
}

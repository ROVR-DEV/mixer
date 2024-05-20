import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

export interface TimelineScrollProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLInputElement> {
  timelineScrollWidth: number;
  xPadding?: number;
  scrollDivRef: RefObject<TimelineScrollDivRef>;
  onChange?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface TimelineScrollDivRef {
  setScroll: (value: number) => void;
}

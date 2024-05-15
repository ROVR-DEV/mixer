import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

export interface TimelineScrollProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLInputElement> {
  timelineScrollWidth: number;
  xPadding?: number;
  scrollDivProps: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLInputElement
  >;
  scrollDivRef: RefObject<TimelineScrollDivRef>;
}

export interface TimelineScrollDivRef {
  setScroll: (value: number) => void;
}

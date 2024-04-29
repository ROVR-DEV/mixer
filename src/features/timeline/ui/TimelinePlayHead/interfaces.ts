import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface TimelinePlayHeadProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  leftPadding: number;
}

export interface TimelinePlayHeadRef {
  updatePosition: (
    time: number,
    shift: number,
    pixelsPerSecond: number,
    timelineWidth: number,
  ) => void;
}

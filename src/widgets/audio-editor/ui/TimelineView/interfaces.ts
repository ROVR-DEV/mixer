import { RefObject } from 'react';

export interface TimelineProps extends React.ComponentProps<'div'> {
  timelineRef: RefObject<HTMLDivElement>;
}

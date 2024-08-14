import { Ref } from 'react';

export interface TimelineProps extends React.ComponentProps<'div'> {
  timelineRef: Ref<HTMLDivElement>;
}

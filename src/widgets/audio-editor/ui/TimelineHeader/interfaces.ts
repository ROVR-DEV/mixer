import { RefObject } from 'react';

export interface TimelineHeaderProps extends React.ComponentProps<'div'> {
  rulerRef: RefObject<HTMLDivElement>;
  centerLine?: boolean;
  endBorder?: boolean;
}

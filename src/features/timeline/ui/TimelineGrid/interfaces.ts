import { ComponentProps } from 'react';

export interface TimelineGridProps extends ComponentProps<'canvas'> {
  zoom: number;
  color: string;
  width: number;
}

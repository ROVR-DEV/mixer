import { Property } from 'csstype';
import { RefObject } from 'react';

import { Tick } from '../../model';

export interface TimelineRulerProps extends React.ComponentPropsWithRef<'div'> {
  controlRef: RefObject<TimelineRulerRef>;
  canvasProps?: React.ComponentPropsWithoutRef<'canvas'>;
  centerLine?: boolean;
}

export interface TimelineRulerRef {
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    zoom: number,
    color?: Property.Color | undefined,
  ) => void;
}

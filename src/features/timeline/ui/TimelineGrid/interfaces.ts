import { Property } from 'csstype';
import { RefObject } from 'react';

import { Tick } from '../../model';

export interface TimelineGridProps
  extends React.ComponentPropsWithoutRef<'canvas'> {
  height: number;
  controlRef: RefObject<TimelineGridRef>;
}

export interface TimelineGridRef {
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    tickColor?: Property.Color | undefined,
    subTickColor?: Property.Color | undefined,
  ) => void;
}

import { Property } from 'csstype';
import { CSSProperties, RefObject } from 'react';

import { Tick } from '../../model';

export interface TimelineGridProps
  extends React.ComponentPropsWithoutRef<'canvas'> {
  height: CSSProperties['height'];
  controlRef:
    | ((ref: TimelineGridRef | null) => void)
    | RefObject<TimelineGridRef>;
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

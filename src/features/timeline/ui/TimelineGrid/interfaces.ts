import { Property } from 'csstype';
import { ComponentProps } from 'react';

import { Tick } from '../../model';

export interface TimelineGridProps extends ComponentProps<'canvas'> {
  width: number;
  height?: number;
}

export interface TimelineGridRef {
  // render: (
  //   width: number,
  //   zoom: number,
  //   shift: number,
  //   ticksStartPadding: number,
  //   color?: Property.Color | undefined,
  // ) => void;
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    tickColor?: Property.Color | undefined,
    subTickColor?: Property.Color | undefined,
  ) => void;
}

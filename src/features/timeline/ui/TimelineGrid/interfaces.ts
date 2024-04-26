import { Property } from 'csstype';
import { CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

import { Tick } from '../../model';

export interface TimelineGridProps
  extends Omit<
    DetailedHTMLProps<
      CanvasHTMLAttributes<HTMLCanvasElement>,
      HTMLCanvasElement
    >,
    'ref'
  > {}

export interface TimelineGridRef {
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    tickColor?: Property.Color | undefined,
    subTickColor?: Property.Color | undefined,
  ) => void;
}

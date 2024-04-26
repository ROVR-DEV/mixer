import { Property } from 'csstype';
import { CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

import { Tick } from '../../model';

export interface TimelineRulerProps
  extends Omit<
    DetailedHTMLProps<
      CanvasHTMLAttributes<HTMLCanvasElement>,
      HTMLCanvasElement
    >,
    'ref'
  > {}

export interface TimelineRulerRef {
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    color?: Property.Color | undefined,
  ) => void;
}

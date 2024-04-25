import { Property } from 'csstype';
import { CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

import { Tick } from '../../model';

export interface TimelineRulerProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  width: number;
  height?: number;
}

export interface TimelineRulerRef {
  render: (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    ticksStartPadding: number,
    shift: number,
    color?: Property.Color | undefined,
  ) => void;
  // render: (
  //   width: number,
  //   zoom: number,
  //   shift: number,
  //   ticksStartPadding: number,
  //   color?: Property.Color | undefined,
  // ) => void;
}

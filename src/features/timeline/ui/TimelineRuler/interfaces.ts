import { CSSProperties, CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

export interface TimelineRulerProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  ticksStartPadding?: number;
  shiftPercent: number;
  zoom: number;
  width: number;
  color?: CSSProperties['color'];
}

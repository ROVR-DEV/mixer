import { CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

export interface TimelineRulerProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  shiftPercent: number;
  zoom: number;
  width: number;
}

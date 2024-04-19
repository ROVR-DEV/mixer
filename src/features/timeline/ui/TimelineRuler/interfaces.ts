import { CSSProperties, CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

export interface TimelineRulerProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  timelineWidth: number;
  width: number;
  height?: number;
  zoom: number;
  ticksStartPadding?: number;
  shift: number;
  color?: CSSProperties['color'];
}

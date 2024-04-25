import { CanvasHTMLAttributes, DetailedHTMLProps } from 'react';

export interface TimelineCanvasProps
  extends DetailedHTMLProps<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {
  width: number;
  height: number;
  dpi: number;
}

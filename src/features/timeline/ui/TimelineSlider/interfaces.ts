import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

export interface TimelineSliderProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  timelineScrollWidth: number;
  xPadding?: number;
}

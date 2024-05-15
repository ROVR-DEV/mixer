import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface ClockProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {}

export interface ClockRef {
  updateTime: (time: number) => void;
}

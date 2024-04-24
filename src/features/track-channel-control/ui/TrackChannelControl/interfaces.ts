import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface TrackChannelControlProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  number: number;
  isAbleToRemove?: boolean;
  onClickRemove: () => void;
}

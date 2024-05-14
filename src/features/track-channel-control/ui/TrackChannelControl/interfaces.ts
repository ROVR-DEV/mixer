import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface TrackChannelControlProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  number: number;
  isAbleToRemove?: boolean;
  isMuted?: boolean;
  isSolo?: boolean;
  onClickMute: () => void;
  onClickSolo: () => void;
  onClickRemove: () => void;
  isSelected?: boolean;
}

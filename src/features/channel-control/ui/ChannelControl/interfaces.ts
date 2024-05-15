import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface TrackChannelControlProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  number: number;
  isAbleToRemove?: boolean;
  isMuted?: boolean;
  isSolo?: boolean;
  onClickMute: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickSolo: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickAutomation: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isSelected?: boolean;
}

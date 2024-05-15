import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface ChannelListItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  disableBorder?: boolean;
  isSelected?: boolean;
  isMuted?: boolean;
}

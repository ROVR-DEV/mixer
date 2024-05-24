import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Channel } from '@/entities/channel';

export interface ChannelControlProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  channel: Channel;
  number: number;
  isSelected?: boolean;
  isAbleToRemove?: boolean;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

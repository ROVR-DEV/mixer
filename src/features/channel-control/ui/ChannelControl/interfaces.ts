import { Channel } from '@/entities/channel';

export interface ChannelControlProps extends React.ComponentProps<'div'> {
  channel: Channel;
  number: number;
  isSelected?: boolean;
  isAbleToRemove?: boolean;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

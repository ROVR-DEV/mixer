import { Channel, ChannelListItemProps } from '@/entities/channel';

export interface ChannelListItemViewProps
  extends Omit<ChannelListItemProps, 'ref'> {
  channel: Channel;
  ignoreMuted?: boolean;
}

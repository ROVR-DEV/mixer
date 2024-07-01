import { Player } from '@/entities/audio-editor';
import { Channel, ChannelListItemProps } from '@/entities/channel';

export interface ChannelListItemViewProps
  extends Omit<ChannelListItemProps, 'ref'> {
  player: Player;
  channel: Channel;
  ignoreMuted?: boolean;
}

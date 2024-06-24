import { Player } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';

import { ChannelControlProps } from '..';

export interface ChannelControlViewProps
  extends Omit<ChannelControlProps, 'onClickRemove'> {
  player: Player;
  channel: Channel;
}

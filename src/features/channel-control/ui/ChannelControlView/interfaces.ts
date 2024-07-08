import { Channel } from '@/entities/channel';

import { ChannelControlProps } from '..';

export interface ChannelControlViewProps
  extends Omit<ChannelControlProps, 'onClickRemove'> {
  channel: Channel;
}

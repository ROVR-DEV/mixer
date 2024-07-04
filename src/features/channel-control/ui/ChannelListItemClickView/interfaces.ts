import { Channel } from '@/entities/channel';

export interface ChannelListItemClickViewProps
  extends React.ComponentProps<'div'> {
  channel: Channel;
}

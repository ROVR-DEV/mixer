import { ChannelListProps } from '@/entities/channel';
import { Playlist } from '@/entities/playlist';

export interface ChannelsListHeaderProps extends Omit<ChannelListProps, 'ref'> {
  playlist: Playlist;
}

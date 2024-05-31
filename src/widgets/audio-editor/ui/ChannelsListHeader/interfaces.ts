import { ChannelListProps } from '@/entities/channel';
import { PlaylistDTO } from '@/entities/playlist';

export interface ChannelsListHeaderProps extends Omit<ChannelListProps, 'ref'> {
  playlist: PlaylistDTO;
}

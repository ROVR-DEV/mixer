import { cn } from '@/shared/lib';

import {
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';
import { PlaylistInfoMemoized } from '@/entities/playlist';

import { ChannelsListHeaderProps } from './interfaces';

export const ChannelsListHeader = ({
  playlist,
  className,
  ...props
}: ChannelsListHeaderProps) => {
  return (
    <ChannelListMemoized className={cn('min-w-[296px]', className)} {...props}>
      <ChannelListItemMemoized className='h-[72px] items-start' disableBorder>
        <PlaylistInfoMemoized
          totalPlaytime={playlist.duration_in_seconds}
          tracksCount={playlist.tracks.length}
        />
      </ChannelListItemMemoized>
    </ChannelListMemoized>
  );
};

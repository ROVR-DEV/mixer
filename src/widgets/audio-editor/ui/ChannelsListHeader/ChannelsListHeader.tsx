import { memo } from 'react';

import {
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';
import { PlaylistInfoMemoized } from '@/entities/playlist';

import { ChannelsListHeaderProps } from './interfaces';

export const ChannelsListHeader = ({
  playlist,
  ...props
}: ChannelsListHeaderProps) => {
  return (
    <ChannelListMemoized {...props}>
      <ChannelListItemMemoized className='h-[72px] items-center' leftPadding>
        <PlaylistInfoMemoized
          totalPlaytime={playlist.duration_in_seconds}
          tracksCount={playlist.tracks.length}
        />
      </ChannelListItemMemoized>
    </ChannelListMemoized>
  );
};

export const ChannelsListHeaderMemoized = memo(ChannelsListHeader);

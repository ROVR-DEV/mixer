import { memo, useMemo } from 'react';

import { parseSecondsToParts } from '@/shared/lib';

import { PlaylistInfoProps } from './interfaces';

export const PlaylistInfo = ({
  totalPlaytime,
  tracksCount,
  ...props
}: PlaylistInfoProps) => {
  const { minutes, seconds, milliseconds } = useMemo(() => {
    return parseSecondsToParts(totalPlaytime);
  }, [totalPlaytime]);

  return (
    <span className='text-third' {...props}>
      <span>
        <span className='font-bold'>{'Playlist time: '}</span>
        <span>{`${minutes}:${seconds}:${milliseconds}`}</span>
      </span>
      <br />
      <span>
        <span className='font-bold'>{'Tracks: '}</span>
        <span>{tracksCount}</span>
      </span>
    </span>
  );
};

export const PlaylistInfoMemoized = memo(PlaylistInfo);

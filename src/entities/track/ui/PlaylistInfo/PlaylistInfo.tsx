import { memo, useMemo } from 'react';

import { parseSecondsToParts } from '../../lib';

import { PlaylistInfoProps } from './interfaces';

export const PlaylistInfo = ({
  totalPlaytime,
  tracksCount,
  ...props
}: PlaylistInfoProps) => {
  const { seconds, milliseconds, microseconds } = useMemo(() => {
    return parseSecondsToParts(totalPlaytime);
  }, [totalPlaytime]);

  return (
    <span className='text-third' {...props}>
      <span>
        <span className='font-bold'>{'Playlist time: '}</span>
        <span>{`${seconds}:${milliseconds}:${microseconds}`}</span>
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

import { memo } from 'react';

import { PlaylistInfoProps } from './interfaces';

export const PlaylistInfo = ({ ...props }: PlaylistInfoProps) => {
  return (
    <span className='text-third' {...props}>
      <span>
        <span className='font-bold'>{'Playlist time: '}</span>
        <span>{'030:04:39'}</span>
      </span>
      <br />
      <span>
        <span className='font-bold'>{'Tracks: '}</span>
        <span>{'37'}</span>
      </span>
    </span>
  );
};

export const PlaylistInfoMemoized = memo(PlaylistInfo);

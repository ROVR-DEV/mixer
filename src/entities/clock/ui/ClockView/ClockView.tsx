'use client';

import { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line boundaries/element-types
import { usePlayer } from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
import { invalidatePlaylist } from '@/entities/playlist';

import { ClockMemoized, ClockRef } from '../Clock';

import { ClockViewProps } from './interfaces';

export const ClockView = ({ ...props }: ClockViewProps) => {
  const clockRef = useRef<ClockRef | null>(null);
  const player = usePlayer();

  useEffect(() => {
    const updateClock = (time: number) =>
      requestAnimationFrame(() => {
        return clockRef.current?.updateTime(time);
      });
    updateClock(player.time);

    player.on('timeupdate', updateClock);
    return () => player.off('timeupdate', updateClock);
  }, [player]);

  const kek = useCallback(() => {
    if (player.playlist?.id === undefined) {
      return;
    }

    invalidatePlaylist(player.playlist.id);
  }, [player.playlist?.id]);

  return (
    <ClockMemoized
      className='cursor-pointer'
      ref={clockRef}
      onClick={kek}
      {...props}
    />
  );
};

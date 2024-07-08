import { useEffect, useRef } from 'react';

// eslint-disable-next-line boundaries/element-types
import { usePlayer } from '@/entities/audio-editor';

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

  return <ClockMemoized ref={clockRef} {...props} />;
};

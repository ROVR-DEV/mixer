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
      requestAnimationFrame(() => clockRef.current?.updateTime(time));
    updateClock(player.time);

    player.addListener(updateClock);
    return () => player.removeListener(updateClock);
  }, [player]);

  return <ClockMemoized ref={clockRef} {...props} />;
};

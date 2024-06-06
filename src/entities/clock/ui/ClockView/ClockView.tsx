import { useEffect, useRef } from 'react';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditorManager } from '@/entities/audio-editor';

import { ClockMemoized, ClockRef } from '../Clock';

import { ClockViewProps } from './interfaces';

export const ClockView = ({ ...props }: ClockViewProps) => {
  const clockRef = useRef<ClockRef | null>(null);
  const audioEditorManager = useAudioEditorManager();

  useEffect(() => {
    const updateClock = (time: number) =>
      requestAnimationFrame(() => clockRef.current?.updateTime(time));
    updateClock(audioEditorManager.time);

    audioEditorManager.addListener(updateClock);
    return () => audioEditorManager.removeListener(updateClock);
  }, [audioEditorManager]);

  return <ClockMemoized ref={clockRef} {...props} />;
};

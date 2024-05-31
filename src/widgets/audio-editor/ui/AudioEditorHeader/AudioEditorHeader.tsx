'use client';

import { observer } from 'mobx-react-lite';
import { memo, useEffect, useRef } from 'react';

import { HEADER_LAYOUT } from '@/shared/config/sharedStyles';
import { cn } from '@/shared/lib';

import { ClockMemoized, ClockRef } from '@/entities/clock';
import { TrackInfoView } from '@/entities/track';

import { PlayButtonView, StopButtonView } from '@/features/audio-editor';

import { TrackInfoPanelProps } from './interfaces';

export const AudioEditorHeader = observer(function AudioEditorHeader({
  audioEditorManager,
  className,
  ...props
}: TrackInfoPanelProps) {
  const clockRef = useRef<ClockRef | null>(null);

  useEffect(() => {
    const updateClock = (time: number) => {
      clockRef.current?.updateTime(time);
    };

    audioEditorManager.addListener(updateClock);

    return () => audioEditorManager.removeListener(updateClock);
  }, [audioEditorManager]);

  return (
    <div className={cn(HEADER_LAYOUT, className)} {...props}>
      <div className='flex items-center gap-4 justify-self-end'>
        <StopButtonView audioEditorManager={audioEditorManager} />
        <PlayButtonView audioEditorManager={audioEditorManager} />
      </div>
      <ClockMemoized ref={clockRef} />
      <TrackInfoView
        className='w-[450px] justify-self-end'
        audioEditorManager={audioEditorManager}
      />
    </div>
  );
});

export const AudioEditorHeaderMemoized = memo(AudioEditorHeader);

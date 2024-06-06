'use client';

import { memo } from 'react';

import { HEADER_LAYOUT } from '@/shared/config/sharedStyles';
import { cn } from '@/shared/lib';

import { ClockView } from '@/entities/clock';
import { TrackInfoView } from '@/entities/track';

import { PlayButtonView, StopButtonView } from '@/features/audio-editor';

import { AudioEditorHeaderProps } from './interfaces';

export const AudioEditorHeader = ({
  className,
  ...props
}: AudioEditorHeaderProps) => {
  return (
    <div className={cn(HEADER_LAYOUT, className)} {...props}>
      <div className='flex items-center gap-4 justify-self-end'>
        <StopButtonView />
        <PlayButtonView />
      </div>
      <ClockView />
      <TrackInfoView className='w-[450px] justify-self-end' />
    </div>
  );
};

export const AudioEditorHeaderMemoized = memo(AudioEditorHeader);

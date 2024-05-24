import { observer } from 'mobx-react-lite';
import { memo } from 'react';

import { HEADER_LAYOUT } from '@/shared/config/sharedStyles';
import { cn } from '@/shared/lib';

import { ClockMemoized } from '@/entities/clock';
import { TrackInfoView } from '@/entities/track';

import { PlayButtonView, StopButtonView } from '@/features/audio-editor';

import { TrackInfoPanelProps } from './interfaces';

export const AudioEditorHeader = observer(function AudioEditorHeader({
  clockRef,
  audioEditorManager,
  className,
  ...props
}: TrackInfoPanelProps) {
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

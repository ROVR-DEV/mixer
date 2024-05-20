import { observer } from 'mobx-react-lite';
import { memo } from 'react';

import { cn } from '@/shared/lib';
import { Badge, IconButton } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@/shared/ui/assets';

import { ClockMemoized } from '@/entities/clock';
import { TrackInfo } from '@/entities/track';

import { TrackInfoPanelProps } from './interfaces';

export const AudioEditorHeader = observer(function AudioEditorHeader({
  clockRef,
  audioEditorManager,
  className,
  ...props
}: TrackInfoPanelProps) {
  return (
    <div
      className={cn(
        'grid grid-rows-1 grid-cols-[1fr_auto_1fr] gap-4 justify-center items-center',
        className,
      )}
      {...props}
    >
      <div className='flex flex-1 items-center gap-4 justify-self-end'>
        <IconButton
          disabled={!audioEditorManager.isPlaying}
          variant={
            audioEditorManager.isPlaying ? 'primaryFilled' : 'secondaryFilled'
          }
          aria-label='Stop'
          onClick={audioEditorManager.stop}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          className='pl-[2px]'
          disabled={audioEditorManager.isPlaying}
          variant={
            audioEditorManager.isPlaying ? 'secondaryFilled' : 'primaryFilled'
          }
          aria-label='Play'
          onClick={audioEditorManager.play}
        >
          <PlayIcon />
        </IconButton>
      </div>
      <Badge className='col-start-2 h-[34px] w-[140px]' variant='filled'>
        <ClockMemoized ref={clockRef} />
      </Badge>
      <div className='flex w-[450px] justify-self-end'>
        <TrackInfo
          className='w-full'
          track={audioEditorManager.selectedTrack?.data ?? null}
        />
      </div>
    </div>
  );
});

export const AudioEditorHeaderMemoized = memo(AudioEditorHeader);

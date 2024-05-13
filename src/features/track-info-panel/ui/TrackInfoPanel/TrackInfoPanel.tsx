import { memo } from 'react';

import { cn } from '@/shared/lib';
import { Badge, IconButton } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@/shared/ui/assets';

import { TrackInfo } from '@/entities/track';

import { ClockMemoized } from '../Clock';

import { TrackInfoPanelProps } from './interfaces';

export const TrackInfoPanel = ({
  onPlay,
  onStop,
  playing,
  clockRef,
  className,
  ...props
}: TrackInfoPanelProps) => {
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
          disabled={!playing}
          variant={playing ? 'primaryFilled' : 'secondaryFilled'}
          aria-label='Stop'
          onClick={onStop}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          className='pl-[2px]'
          disabled={playing}
          variant={playing ? 'secondaryFilled' : 'primaryFilled'}
          aria-label='Play'
          onClick={onPlay}
        >
          <PlayIcon />
        </IconButton>
      </div>
      <Badge className='col-start-2 h-[34px] w-[140px]' variant='filled'>
        <ClockMemoized ref={clockRef} />
      </Badge>
      <div className='flex w-[450px] justify-self-end'>
        <TrackInfo className='w-full' />
      </div>
    </div>
  );
};

export const TrackInfoPanelMemoized = memo(TrackInfoPanel);

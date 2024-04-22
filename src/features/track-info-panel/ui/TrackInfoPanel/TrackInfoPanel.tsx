import { memo, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Badge, IconButton } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@/shared/ui/assets';

import { TrackInfo } from '@/entities/track';

import { TrackInfoPanelProps } from './interfaces';

export const TrackInfoPanel = ({
  onPlay,
  onStop,
  playing,
  time,
  className,
  ...props
}: TrackInfoPanelProps) => {
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const playingRef = useRef(playing);

  const calcTime = () => {
    const timeElement = timeRef.current;
    const timeValue = time.current;

    if (timeElement && timeValue !== null) {
      const millis = timeValue * 1000;

      const minutes = Math.floor(millis / (1000 * 60));
      const seconds = Math.floor((millis - minutes * 1000 * 60) / 1000);
      const milliseconds = Math.floor(
        millis - minutes * 1000 * 60 - seconds * 1000,
      );

      const toText = (value: number, digits: number = 2) =>
        value.toLocaleString('en-US', {
          minimumIntegerDigits: digits,
          useGrouping: false,
        });

      timeElement.children[0].textContent = toText(minutes);
      timeElement.children[2].textContent = toText(seconds);
      timeElement.children[4].textContent = toText(milliseconds, 3);
    }

    if (playingRef.current) {
      requestAnimationFrame(calcTime);
    }
  };

  useEffect(() => {
    requestAnimationFrame(calcTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    playingRef.current = playing;
    if (playing) {
      requestAnimationFrame(calcTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return (
    <div
      className={cn(
        'grid grid-rows-1 grid-cols-[1fr_auto_1fr] gap-4 justify-center',
        className,
      )}
      {...props}
    >
      <div className='col-start-2 flex flex-1 items-center justify-center gap-4'>
        <IconButton
          variant={playing ? 'primaryFilled' : 'secondaryFilled'}
          aria-label='Stop'
          onClick={onStop}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          className='pl-[2px]'
          variant={playing ? 'secondaryFilled' : 'primaryFilled'}
          aria-label='Play'
          onClick={onPlay}
        >
          <PlayIcon />
        </IconButton>
        <Badge className='h-[34px] w-[140px]' variant='filled'>
          <span className='flex text-[19px] font-fix' ref={timeRef}>
            <span className='text-center' />
            <span className='max-w-[4px]'>{':'}</span>
            <span className='min-w-[24px] max-w-[24px] text-center' />
            <span className='max-w-[4px]'>{':'}</span>
            <span className='min-w-[32px] max-w-[32px] text-center' />
          </span>
        </Badge>
      </div>
      <div className='flex justify-end'>
        <TrackInfo className='w-max' />
      </div>
    </div>
  );
};

export const TrackInfoPanelMemoized = memo(TrackInfoPanel);

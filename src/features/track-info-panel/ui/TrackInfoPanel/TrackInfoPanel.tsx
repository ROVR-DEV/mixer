import { memo, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';
import { Badge, IconButton } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@/shared/ui/assets';

import { TrackInfo, parseSecondsToParts } from '@/entities/track';

import { TrackInfoPanelProps } from './interfaces';

const minutesFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 3,
  useGrouping: false,
});

const secondsAndMillisecondsFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

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
      const { minutes, seconds, milliseconds } = parseSecondsToParts(timeValue);

      timeElement.children[0].textContent = minutesFormatter.format(minutes);
      timeElement.children[2].textContent =
        secondsAndMillisecondsFormatter.format(seconds);
      timeElement.children[4].textContent =
        secondsAndMillisecondsFormatter.format(Math.floor(milliseconds / 10));
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
        'grid grid-rows-1 grid-cols-[1fr_auto_1fr] gap-4 justify-center items-center',
        className,
      )}
      {...props}
    >
      <div className='flex flex-1 items-center gap-4 justify-self-end'>
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
      </div>
      <Badge className='col-start-2 h-[34px] w-[140px]' variant='filled'>
        <span className='flex text-[19px] font-fix' ref={timeRef}>
          <span className='w-[38px] min-w-[38px] max-w-[38px] text-center' />
          <span className='max-w-[4px]'>{':'}</span>
          <span className='w-[25px] min-w-[25px] max-w-[25px] text-center' />
          <span className='max-w-[4px]'>{':'}</span>
          <span className='w-[25px] min-w-[25px] max-w-[25px] text-center' />
        </span>
      </Badge>
      <div className='flex w-[450px] justify-self-end'>
        <TrackInfo className='w-full' />
      </div>
    </div>
  );
};

export const TrackInfoPanelMemoized = memo(TrackInfoPanel);

import { forwardRef, memo, useImperativeHandle, useRef } from 'react';

import { cn } from '@/shared/lib';

import { parseSecondsToParts } from '@/entities/track';

import {
  minutesFormatter,
  secondsAndMillisecondsFormatter,
} from '../../config';

import { ClockProps, ClockRef } from './interfaces';

export const Clock = forwardRef<ClockRef, ClockProps>(function Clock(
  { className, ...props },
  ref,
) {
  useImperativeHandle(ref, () => ({ updateTime }));

  const clockRef = useRef<HTMLSpanElement | null>(null);

  const updateTime = (time: number) => {
    const clock = clockRef.current;

    if (!clock) {
      return;
    }

    const { minutes, seconds, milliseconds } = parseSecondsToParts(time);

    clock.children[0].textContent = minutesFormatter.format(minutes);

    clock.children[2].textContent =
      secondsAndMillisecondsFormatter.format(seconds);

    clock.children[4].textContent = secondsAndMillisecondsFormatter.format(
      Math.floor(milliseconds / 10),
    );
  };

  return (
    <span
      className={cn('flex text-[19px] font-fix', className)}
      ref={clockRef}
      {...props}
    >
      <span className='w-[38px] min-w-[38px] max-w-[38px] text-center'>
        {'000'}
      </span>
      <span className='max-w-[4px]'>{':'}</span>
      <span className='w-[25px] min-w-[25px] max-w-[25px] text-center'>
        {'00'}
      </span>
      <span className='max-w-[4px]'>{':'}</span>
      <span className='w-[25px] min-w-[25px] max-w-[25px] text-center'>
        {'00'}
      </span>
    </span>
  );
});

export const ClockMemoized = memo(Clock);

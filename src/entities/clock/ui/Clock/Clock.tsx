import { forwardRef, memo, useImperativeHandle, useRef } from 'react';

import { cn, parseSecondsToParts } from '@/shared/lib';
import { Badge } from '@/shared/ui';

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

    const minutesText = minutesFormatter.format(minutes);
    const secondsText = secondsAndMillisecondsFormatter.format(seconds);

    if (clock.children[0].textContent !== minutesText) {
      clock.children[0].textContent = minutesText;
    }

    if (clock.children[2].textContent !== secondsText) {
      clock.children[2].textContent = secondsText;
    }

    clock.children[4].textContent = secondsAndMillisecondsFormatter.format(
      Math.floor(milliseconds / 10),
    );
  };

  return (
    <Badge
      className={cn('h-[34px] w-[116px]', className)}
      variant='filled'
      {...props}
    >
      <span className={cn('flex text-[19px]  font-fix')} ref={clockRef}>
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
    </Badge>
  );
});

export const ClockMemoized = memo(Clock);

import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';
import { PlayHeadIcon } from '@/shared/ui/assets';

import { TimelinePlayHeadProps } from './interfaces';

export const TimelinePlayHead = forwardRef<
  HTMLDivElement,
  TimelinePlayHeadProps
>(function TimelinePlayHead(
  { initialPosition, className, style, ...props },
  ref,
) {
  return (
    <div
      className={cn('absolute top-0 h-full pointer-events-none', className)}
      ref={ref}
      style={{ left: initialPosition ?? '', ...style }}
      {...props}
    >
      <PlayHeadIcon className='absolute left-[-9px]' width={19} height={19} />
      <div className='mx-auto h-full w-px bg-accent/40' />
    </div>
  );
});

export const TimelinePlayHeadMemoized = memo(TimelinePlayHead);

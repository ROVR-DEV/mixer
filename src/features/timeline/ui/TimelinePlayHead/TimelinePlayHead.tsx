import { forwardRef, useImperativeHandle, useRef } from 'react';

import { cn } from '@/shared/lib';
import { PlayHeadIcon } from '@/shared/ui/assets';

import { TimelinePlayHeadProps, TimelinePlayHeadRef } from './interfaces';

export const TimelinePlayHead = forwardRef<
  TimelinePlayHeadRef,
  TimelinePlayHeadProps
>(function TimelinePlayHead({ leftPadding, className, ...props }, ref) {
  useImperativeHandle(ref, () => ({ updatePosition }));

  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = (
    time: number,
    shift: number,
    pixelsPerSecond: number,
    timelineWidth: number,
  ) => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    const newPosition =
      time * pixelsPerSecond - shift * pixelsPerSecond + leftPadding;

    playHead.style.left = `${newPosition}px`;
    playHead.style.display =
      newPosition < 0 || newPosition > timelineWidth ? 'none' : 'block';
  };

  return (
    <div
      className={cn('absolute top-0 h-full', className)}
      ref={playHeadRef}
      style={{ left: leftPadding }}
      {...props}
    >
      <PlayHeadIcon className='absolute left-[-9px]' width={19} height={19} />
      <div className='mx-auto h-full w-px bg-accent/40' />
    </div>
  );
});

'use client';

import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { TimelineSliderProps } from './interfaces';
import styles from './styles.module.css';

export const TimelineSlider = forwardRef<HTMLDivElement, TimelineSliderProps>(
  function TimelineSlider(
    { timelineScrollWidth, xPadding = 0, className, ...props },
    ref,
  ) {
    return (
      <div
        className={cn(
          'mb-2 w-full overflow-x-scroll',
          styles.timelineSlider,
          className,
        )}
        ref={ref}
        style={{ paddingLeft: xPadding, paddingRight: xPadding }}
        {...props}
      >
        <div
          className='h-px'
          style={{ width: timelineScrollWidth - xPadding * 2 }}
        />
      </div>
    );
  },
);

export const TimelineSliderMemoized = memo(TimelineSlider);

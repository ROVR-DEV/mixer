'use client';

import { memo } from 'react';

import { cn } from '@/shared/lib';

import { Timeline2ScrollProps } from './interfaces';
import styles from './styles.module.css';

export const Timeline2Scroll = ({
  timelineScrollWidth,
  scrollDivRef,
  scrollDivProps,
  className,
  ...props
}: Timeline2ScrollProps) => {
  return (
    <div className={cn('mb-2 overflow-hidden', className)} {...props}>
      <div
        className={cn(
          'w-full h-[10px] min-h-[10px] overflow-x-scroll outline-none',
          styles.timelineScroll,
        )}
        ref={scrollDivRef}
        {...scrollDivProps}
      >
        <div
          className='h-px'
          style={{
            width: `${timelineScrollWidth}px`,
          }}
        />
      </div>
    </div>
  );
};

export const Timeline2ScrollMemoized = memo(Timeline2Scroll);

'use client';

import { memo, useImperativeHandle, useRef } from 'react';

import { cn } from '@/shared/lib';

import { TimelineScrollProps } from './interfaces';
import styles from './styles.module.css';

export const TimelineScroll = ({
  timelineScrollWidth,
  xPadding = 0,
  scrollDivRef,
  onChange,
  className,
  ...props
}: TimelineScrollProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(scrollDivRef, () => ({ setScroll }));

  const setScroll = (value: number) => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.dataset.synthetic = 'true';
    scrollRef.current.scrollLeft = value;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.dataset.synthetic) {
      e.currentTarget.dataset.synthetic = '';
      return;
    }
    onChange?.(e);
  };

  return (
    <div
      className={cn('mb-2 overflow-hidden', className)}
      style={{ paddingLeft: xPadding, paddingRight: xPadding }}
      {...props}
    >
      <div
        className={cn('w-full overflow-x-scroll', styles.timelineScroll)}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div
          className='h-px'
          style={{ width: timelineScrollWidth - xPadding * 2 }}
        />
      </div>
    </div>
  );
};

export const TimelineScrollMemoized = memo(TimelineScroll);

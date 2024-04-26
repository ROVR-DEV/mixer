'use client';

import { useRef } from 'react';

import { cn } from '@/shared/lib';

import { TimelineSliderProps } from './interfaces';
import styles from './styles.module.css';

const TimelineSlider = ({
  zoom,
  realWidth,
  className,
  ...props
}: TimelineSliderProps) => {
  const ref = useRef<HTMLInputElement | null>(null);

  return (
    <input
      ref={ref}
      type='range'
      min={0}
      max={100}
      className={cn(styles.timelineSlider, className)}
      style={{
        // @ts-expect-error Type
        '--thumb-width': `calc(${ref.current?.clientWidth} / ${realWidth * zoom} * 100%)`,
      }}
      {...props}
    />
  );
};

export default TimelineSlider;

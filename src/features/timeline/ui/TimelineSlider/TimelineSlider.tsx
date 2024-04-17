'use client';

import { cn } from '@/shared/lib/cn';

import { TimelineSliderProps } from './interfaces';
import styles from './styles.module.css';

const TimelineSlider = ({ zoom, className, ...props }: TimelineSliderProps) => {
  return (
    <input
      type='range'
      min={0}
      max={50}
      className={cn(styles.timelineSlider, className)}
      style={{
        // @ts-expect-error Type
        '--thumb-width': `calc(100% / ${zoom})`,
      }}
      {...props}
    />
  );
};

export default TimelineSlider;

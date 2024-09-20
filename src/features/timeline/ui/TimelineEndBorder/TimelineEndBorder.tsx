'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { cn } from '@/shared/lib';

import { useTimeline } from '@/entities/audio-editor';

import { TimelineEndBorderProps } from './interfaces';

export const TimelineEndBorder = observer(function TimelineEndBorder({
  className,
  ...props
}: TimelineEndBorderProps) {
  const timeline = useTimeline();

  const position = useMemo(() => {
    return timeline.scrollWidth - timeline.hScroll - timeline.endBorderWidth;
  }, [timeline.endBorderWidth, timeline.hScroll, timeline.scrollWidth]);

  return (
    <div
      className={cn('absolute bg-black/40 h-full', className)}
      style={{
        minWidth: timeline.endBorderWidth,
        maxWidth: timeline.endBorderWidth,
        width: timeline.endBorderWidth,
        left: position,
      }}
      {...props}
    />
  );
});

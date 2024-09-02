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
    return (
      timeline.totalTime * timeline.pixelsPerSecond -
      timeline.scroll * timeline.pixelsPerSecond -
      -timeline.timelineLeftPadding -
      20
    );
  }, [
    timeline.pixelsPerSecond,
    timeline.scroll,
    timeline.timelineLeftPadding,
    timeline.totalTime,
  ]);

  return (
    <div
      className={cn('absolute w-[20px] bg-black/40 h-full', className)}
      style={{ left: position }}
      {...props}
    />
  );
});

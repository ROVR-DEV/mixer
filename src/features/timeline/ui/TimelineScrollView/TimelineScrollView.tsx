'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import { useTimeline } from '@/entities/audio-editor';

import {
  TimelineScrollDivRef,
  TimelineScrollMemoized,
} from '../TimelineScroll';

import { TimelineScrollViewProps } from './interfaces';

export const TimelineScrollView = observer(function TimelineScrollView({
  className,
  ...props
}: TimelineScrollViewProps) {
  const horizontalScrollRef = useRef<TimelineScrollDivRef>(null);

  const timeline = useTimeline();

  const updateHorizontalScrollbar = useCallback(
    (scroll: number) => {
      horizontalScrollRef.current?.setScroll(
        scroll - timeline.timeToPixels(timeline.startTime),
      );
    },
    [timeline],
  );

  const handleHorizontalScrollbarOnScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newValue =
        e.currentTarget.scrollLeft + timeline.timeToPixels(timeline.startTime);

      timeline.hScrollController.value = newValue;
    },
    [timeline],
  );

  useEffect(() => {
    updateHorizontalScrollbar(timeline.hScroll);
  }, [timeline.hScroll, updateHorizontalScrollbar]);

  useEffect(() => {
    timeline.hScrollController.addListener(updateHorizontalScrollbar);

    updateHorizontalScrollbar(timeline.hScroll);

    return () =>
      timeline.hScrollController.removeListener(updateHorizontalScrollbar);
  }, [timeline, updateHorizontalScrollbar]);

  return (
    <TimelineScrollMemoized
      className={cn('min-h-[10px]', className)}
      scrollDivRef={horizontalScrollRef}
      timelineScrollWidth={timeline.scrollWidth}
      xPadding={4}
      onChange={handleHorizontalScrollbarOnScroll}
      {...props}
    />
  );
});

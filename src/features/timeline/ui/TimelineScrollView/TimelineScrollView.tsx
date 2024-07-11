'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import { useTimelineController } from '@/entities/audio-editor';

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

  const timeline = useTimelineController();

  const updateHorizontalScrollbar = useCallback(
    (scroll: number) => {
      horizontalScrollRef.current?.setScroll(
        (scroll - timeline.startTime) *
          timeline.timelineContainer.pixelsPerSecond,
      );
    },
    [timeline],
  );

  const handleHorizontalScrollbarOnScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      timeline.scrollController.value =
        e.currentTarget.scrollLeft /
          timeline.timelineContainer.pixelsPerSecond +
        timeline.startTime;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline.scrollController],
  );

  useEffect(() => {
    timeline.scrollController.addListener(updateHorizontalScrollbar);

    return () =>
      timeline.scrollController.removeListener(updateHorizontalScrollbar);
  }, [timeline.scrollController, updateHorizontalScrollbar]);

  return (
    <TimelineScrollMemoized
      className={cn('min-h-[10px]', className)}
      scrollDivRef={horizontalScrollRef}
      timelineScrollWidth={timeline.timelineContainer.timelineScrollWidth}
      xPadding={4}
      onChange={handleHorizontalScrollbarOnScroll}
      {...props}
    />
  );
});

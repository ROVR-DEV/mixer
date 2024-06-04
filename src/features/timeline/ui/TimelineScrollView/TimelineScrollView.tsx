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

  const timelineController = useTimelineController();

  const updateHorizontalScrollbar = useCallback(
    (scroll: number) => {
      horizontalScrollRef.current?.setScroll(
        scroll * timelineController.timelineContainer.pixelsPerSecond,
      );
    },
    [timelineController.timelineContainer.pixelsPerSecond],
  );

  const handleHorizontalScrollbarOnScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      timelineController.scrollController.value =
        e.currentTarget.scrollLeft /
        timelineController.timelineContainer.pixelsPerSecond;
    },
    [
      timelineController.scrollController,
      timelineController.timelineContainer.pixelsPerSecond,
    ],
  );

  useEffect(() => {
    timelineController.scrollController.addListener(updateHorizontalScrollbar);

    return () =>
      timelineController.scrollController.removeListener(
        updateHorizontalScrollbar,
      );
  }, [timelineController.scrollController, updateHorizontalScrollbar]);

  return (
    <TimelineScrollMemoized
      className={cn('min-h-[10px]', className)}
      scrollDivRef={horizontalScrollRef}
      timelineScrollWidth={
        timelineController.timelineContainer.timelineScrollWidth
      }
      xPadding={4}
      onChange={handleHorizontalScrollbarOnScroll}
      {...props}
    />
  );
});

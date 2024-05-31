'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineScrollDivRef,
  TimelineScrollMemoized,
} from '@/features/timeline';

import { TimelineViewFooterProps } from './interfaces';

export const TimelineViewFooter = observer(function TimelineViewFooter({
  timelineController,
  className,
  ...props
}: TimelineViewFooterProps) {
  const horizontalScrollRef = useRef<TimelineScrollDivRef>(null);

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
    <div
      className={cn('grid grow grid-cols-[296px_auto]', className)}
      {...props}
    >
      <TimelineScrollMemoized
        className='col-start-2'
        scrollDivRef={horizontalScrollRef}
        timelineScrollWidth={
          timelineController.timelineContainer.timelineScrollWidth
        }
        xPadding={4}
        onChange={handleHorizontalScrollbarOnScroll}
      />
    </div>
  );
});

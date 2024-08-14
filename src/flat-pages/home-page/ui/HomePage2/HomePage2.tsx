'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';

import {
  TimelineGridMemoized,
  TimelineGridRef,
  useInitializeTimeline,
} from '@/features/timeline';

import { renderDefaultTimelineGrid } from '@/widgets/audio-editor';

import { HomePage2Props } from './interfaces';

export const HomePage2 = observer(function HomePage2({
  searchParams: _,
}: HomePage2Props) {
  const gridControlRef = useRef<TimelineGridRef | null>(null);

  const timeline = useInitializeTimeline({
    endTime: 5000 + 2,
  });

  const timelineRefCallback = useCallback(
    (ref: HTMLDivElement) => {
      timeline.timelineElement = ref;
    },
    [timeline],
  );

  const renderGrid = useCallback(() => {
    renderDefaultTimelineGrid(
      gridControlRef,
      timeline.ticks,
      timeline.hScroll,
      timeline.hPixelsPerSecond,
      timeline.zeroMarkOffset,
    );
  }, [
    timeline.hPixelsPerSecond,
    timeline.hScroll,
    timeline.ticks,
    timeline.zeroMarkOffset,
  ]);

  useEffect(() => {
    renderGrid();
  }, [renderGrid]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      if (e.ctrlKey) {
        timeline.zoomController.increase();
      } else if (e.shiftKey) {
        timeline.hScrollController.increase();
      }
    },
    [timeline.hScrollController, timeline.zoomController],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      if (e.ctrlKey) {
        timeline.zoomController.decrease();
      } else if (e.shiftKey) {
        timeline.hScrollController.decrease();
      }
    },
    [timeline.hScrollController, timeline.zoomController],
  );

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      <div className='relative flex size-full overflow-y-auto overflow-x-clip'>
        <div
          className={cn('relative min-h-max w-full grow overflow-x-clip')}
          ref={timelineRefCallback}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          <TimelineGridMemoized
            className='pointer-events-none absolute w-full'
            height={200}
            controlRef={gridControlRef}
          />
        </div>
      </div>
    </main>
  );
});

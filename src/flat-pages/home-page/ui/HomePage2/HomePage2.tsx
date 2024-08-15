'use client';

import { observer } from 'mobx-react-lite';
import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  Timeline2,
  Timeline2Context,
  useTimelineZoomScrollHandler,
} from '@/entities/audio-editor';

import {
  Timeline2ScrollView,
  TimelineGridMemoized,
  TimelineGridRef,
  TimelineRulerMemoized,
  TimelineRulerRef,
  useInitializeTimeline,
} from '@/features/timeline';

import {
  renderDefaultTimelineGrid,
  renderDefaultTimelineRuler,
} from '@/widgets/audio-editor';

import { HomePage2Props } from './interfaces';

const renderRuler = (
  timeline: Timeline2,
  rulerRef: RefObject<TimelineRulerRef>,
) =>
  renderDefaultTimelineRuler(
    rulerRef,
    timeline.ticks,
    timeline.zoom,
    timeline.hScroll,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffset,
  );

const renderGrid = (timeline: Timeline2, gridRef: RefObject<TimelineGridRef>) =>
  renderDefaultTimelineGrid(
    gridRef,
    timeline.ticks,
    timeline.hScroll,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffset,
  );

export const HomePage2 = observer(function HomePage2({
  searchParams: _,
}: HomePage2Props) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const rulerControlRef = useRef<TimelineRulerRef | null>(null);
  const gridControlRef = useRef<TimelineGridRef | null>(null);

  const canvasProps = useMemo(() => ({ className: 'h-[32px]' }), []);

  const timeline = useInitializeTimeline({
    endTime: 5000 + 2,
    zeroMarkOffsetPx: 5,
    hScrollControllerProps: {
      step: 100,
    },
  });

  const timelineRefCallback = useCallback(
    (ref: HTMLDivElement) => {
      timelineRef.current = ref;
      timeline.timelineElement = ref;
    },
    [timeline],
  );

  useEffect(() => {
    const render = () => {
      renderRuler(timeline, rulerControlRef);
      renderGrid(timeline, gridControlRef);
    };
    render();

    timeline.events.on('change', render);
    return () => {
      timeline.events.off('change', render);
    };
  }, [timeline, timeline.events]);

  useTimelineZoomScrollHandler(rulerRef, timeline);
  useTimelineZoomScrollHandler(timelineRef, timeline);

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      <div className='relative flex size-full flex-col overflow-y-auto overflow-x-clip'>
        <Timeline2Context.Provider value={timeline}>
          <div
            ref={rulerRef}
            className={cn('relative min-h-max w-full grow overflow-x-clip')}
          >
            <TimelineRulerMemoized
              className='pointer-events-none w-full'
              centerLine
              canvasProps={canvasProps}
              controlRef={rulerControlRef}
            />
          </div>
          <div className='relative flex size-full overflow-y-auto overflow-x-clip'>
            <div
              className={cn('relative min-h-max w-full grow overflow-x-clip')}
              ref={timelineRefCallback}
            >
              <TimelineGridMemoized
                className='pointer-events-none absolute w-full'
                height={98 * 3 * timeline.dpi}
                controlRef={gridControlRef}
              />
            </div>
          </div>
          <Timeline2ScrollView />
        </Timeline2Context.Provider>
      </div>
    </main>
  );
});

'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { useTimeline2 } from '@/entities/audio-editor';

import {
  TimelineScrollDivRef,
  TimelineScrollMemoized,
} from '../TimelineScroll';

import { Timeline2ScrollViewProps } from './interfaces';

// TODO: need to map scrollLeft value to actual timeline scroll value,
// because scrollbar can be shorter than timeline client width and it cause problems
export const Timeline2ScrollView = observer(function Timeline2ScrollView({
  ...props
}: Timeline2ScrollViewProps) {
  const timeline = useTimeline2();

  const horizontalScrollRef = useRef<TimelineScrollDivRef>(null);

  const updateHorizontalScrollbar = useCallback(() => {
    horizontalScrollRef.current?.setScroll(
      (timeline.hScroll - timeline.startTime) * timeline.hPixelsPerSecond,
    );
  }, [timeline]);

  const handleHorizontalScrollbarOnScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      timeline.hScroll =
        e.currentTarget.scrollLeft / timeline.hPixelsPerSecond +
        timeline.startTime;
    },
    [timeline],
  );

  useEffect(() => {
    timeline.events.on('hScroll', updateHorizontalScrollbar);

    return () => {
      timeline.events.off('hScroll', updateHorizontalScrollbar);
    };
  }, [timeline.events, updateHorizontalScrollbar]);

  return (
    <TimelineScrollMemoized
      scrollDivRef={horizontalScrollRef}
      timelineScrollWidth={timeline.scrollWidth}
      onChange={handleHorizontalScrollbarOnScroll}
      {...props}
    />
  );
});

// TODO: trying to implement scroll through native element (useTimelineZoomScrollHandler)
// export const Timeline2ScrollView = observer(function Timeline2ScrollView({
//   ...props
// }: Timeline2ScrollViewProps) {
//   const timeline = useTimeline2();

//   const scrollRefHandler = useCallback(
//     (ref: HTMLDivElement) => {
//       timeline.hScrollElement = ref;
//     },
//     [timeline],
//   );

//   const handleHorizontalScrollbarOnScroll = useCallback(
//     (e: React.UIEvent<HTMLDivElement>) => {
//       timeline.hScroll =
//         e.currentTarget.scrollLeft / timeline.hPixelsPerSecond +
//         timeline.startTime;
//     },
//     [timeline],
//   );

//   const scrollDivProps = useMemo(
//     () => ({
//       onScroll: handleHorizontalScrollbarOnScroll,
//     }),
//     [handleHorizontalScrollbarOnScroll],
//   );

//   return (
//     <Timeline2ScrollMemoized
//       scrollDivRef={scrollRefHandler}
//       timelineScrollWidth={timeline.scrollWidth}
//       scrollDivProps={scrollDivProps}
//       {...props}
//     />
//   );
// });

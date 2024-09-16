import { RefObject, useCallback } from 'react';

import { useEventListener } from '@/shared/lib';

import { AudioEditor, Timeline } from '@/entities/audio-editor';

const adjustScroll = (
  timeline: Timeline,
  prevTime: number,
  nextTime: number,
) => {
  const timeDiff = prevTime - nextTime;
  timeline.hScroll += timeline.timeToPixels(timeDiff);
};

export const useTimelineWheelHandler = (
  ref: RefObject<HTMLElement>,
  timeline: Timeline,
  audioEditor?: AudioEditor,
) => {
  const handleZoom = useCallback(
    (delta: number) => {
      const isZoomIn = delta <= 0;

      if (audioEditor?.isFitActivated || timeline.zoom < 1) {
        audioEditor?.fit();
      }

      isZoomIn
        ? timeline.zoomController.increase()
        : timeline.zoomController.decrease();
    },
    [audioEditor, timeline],
  );

  const handleWheelZoom = useCallback(
    (e: WheelEvent) => {
      const prevTime = timeline.globalToTime(e.pageX);
      handleZoom(e.deltaY);
      const nextTime = timeline.globalToTime(e.pageX);

      adjustScroll(timeline, prevTime, nextTime);
    },
    [handleZoom, timeline],
  );

  const handleHorizontalScroll = useCallback(
    (deltaX: number) => {
      timeline.hScrollController.shiftX(deltaX);
    },
    [timeline.hScrollController],
  );

  // Wheel event handler
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.shiftKey || e.deltaX) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Zoom
      if (e.ctrlKey) {
        handleWheelZoom(e);
      }

      // Mouse scroll
      if (e.shiftKey) {
        handleHorizontalScroll(e.deltaY);
      }
      // Track pad scroll
      else if (e.deltaX) {
        handleHorizontalScroll(e.deltaX);
      }
    },
    [handleHorizontalScroll, handleWheelZoom],
  );

  useEventListener(ref, 'wheel', handleWheel, { passive: false });
};

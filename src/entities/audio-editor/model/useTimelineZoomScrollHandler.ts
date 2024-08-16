'use client';

import { RefObject, useCallback } from 'react';

import { useEventListener } from '@/shared/lib';

import { AudioEditor } from './audioEditor';
import { Timeline2 } from './timeline2';

const getScrollToAdjustZoomOffset = (
  x: number,
  scroll: number,
  currentZoom: number,
  newZoom: number,
  pixelsPerSecond: number,
) => {
  const virtualShift = scroll * pixelsPerSecond;

  const newPixelsPerSeconds = newZoom * pixelsPerSecond;

  const currentVirtualX = virtualShift + x * currentZoom;

  const newVirtualX = virtualShift + x * newZoom;

  return scroll + (newVirtualX - currentVirtualX) / newPixelsPerSeconds;
};

export const useTimelineZoomScrollHandler = (
  ref: RefObject<HTMLElement>,
  timeline: Timeline2,
  audioEditor?: AudioEditor,
) => {
  const scrollToZoom = useCallback(
    (e: WheelEvent) => {
      if (
        (timeline.zoomController.value <= 1 && e.deltaY >= 0) ||
        (timeline.zoomController.value >= Math.pow(1.25, 33) && e.deltaY <= 0)
      ) {
        return;
      }

      const newZoom = timeline.zoomController.rule(
        timeline.zoomController.value,
        timeline.zoomController.step,
        e.deltaY <= 0,
      );

      const x = e.pageX - timeline.boundingRect.x - timeline.zeroMarkOffset;

      timeline.hScrollController.value = getScrollToAdjustZoomOffset(
        x,
        timeline.hScrollController.value,
        timeline.zoomController.value,
        newZoom,
        timeline.hPixelsPerSecond,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline.hScrollController, timeline.zoomController],
  );

  const handleWheelZoom = useCallback(
    (delta: number) => {
      const isZoomIn = delta <= 0;

      if (audioEditor?.isFitActivated || timeline.zoom < 1) {
        audioEditor?.fit();
      }

      // TODO: strange behavior with scrolling to cursor
      //  maybe problem with scrollable html element (Timeline2ScrollView)
      // isZoomIn
      //   ? timeline.zoomController.increase({ behavior: 'smooth' })
      //   : timeline.zoomController.decrease({ behavior: 'smooth' });
      isZoomIn
        ? timeline.zoomController.increase()
        : timeline.zoomController.decrease();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioEditor, timeline.zoomController],
  );

  // const hScrollCountRef = useRef(1);
  // const hScrollCountTimerIdRef = useRef<number | null>(null);

  const handleWheelHorizontalScroll = useCallback(
    (delta: number) => {
      const sign = delta >= 0 ? 1 : -1;

      // TODO: try to make scroll through native element if exists
      // hScrollCountRef.current += 1;
      // if (timeline.hScrollElement) {
      //   timeline.hScrollElement.scrollTo({
      //     left:
      //       timeline.hScroll +
      //       sign *
      //         timeline.hScrollController.step *
      //         timeline.hPixelsPerSecond *
      //         hScrollCountRef.current,
      //     behavior: 'smooth',
      //   });
      // } else {
      sign === 1
        ? timeline.hScrollController.increase({ behavior: 'smooth' })
        : timeline.hScrollController.decrease({ behavior: 'smooth' });
      // }

      // if (hScrollCountTimerIdRef.current) {
      //   clearTimeout(hScrollCountTimerIdRef.current);
      // }
      // hScrollCountTimerIdRef.current = delay(() => {
      //   hScrollCountRef.current = 1;
      // }, 20);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline.hScrollController, timeline.hScrollElement],
  );

  // Wheel event handler
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Zoom
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();

        handleWheelZoom(e.deltaY);
        scrollToZoom(e);
      }

      // Mouse scroll
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();

        handleWheelHorizontalScroll(e.deltaY);
      }
      // Track pad scroll
      else if (e.deltaX) {
        e.preventDefault();
        e.stopPropagation();

        handleWheelHorizontalScroll(e.deltaX);
      }
    },
    [handleWheelHorizontalScroll, handleWheelZoom, scrollToZoom],
  );

  useEventListener(ref, 'wheel', handleWheel, { passive: false });
};

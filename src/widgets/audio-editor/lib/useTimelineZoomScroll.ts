'use client';

import { RefObject, useCallback, useEffect, useMemo } from 'react';

import { useWheel } from '@/shared/lib';

import {
  TIMELINE_LEFT_PADDING,
  Timeline,
  useAudioEditor,
} from '@/entities/audio-editor';

export interface TimelineZoomScrollProps {
  container: RefObject<HTMLDivElement>;
  timelineRulerRef: RefObject<HTMLDivElement>;
  startTime?: number;
  endTime: number;
  // Explicit set total time
  totalTime?: number;
  zoomStep?: number;
  scrollStep?: number;
  minZoom?: number;
  maxZoom?: number;
  timelineLeftPadding?: number;
  onZoomChange?: (zoom: number, pixelsPerSecond: number) => void;
  onScrollChange?: (scroll: number, pixelsPerSecond: number) => void;
  onChange?: (zoom: number, scroll: number, pixelsPerSecond: number) => void;
}

export const useTimelineZoomScroll = ({
  container,
  timelineRulerRef,
  totalTime,
  startTime = 0,
  endTime,
  zoomStep = 1.25,
  scrollStep = 100, // Default chrome scroll step
  minZoom = 1,
  maxZoom = Math.pow(1.25, 33),
  timelineLeftPadding = TIMELINE_LEFT_PADDING,
  onZoomChange,
  onScrollChange,
  onChange,
}: TimelineZoomScrollProps): Timeline => {
  const audioEditor = useAudioEditor();

  const timeline = useMemo(
    () =>
      new Timeline({
        container: container.current,
        zoomStep,
        minZoom,
        maxZoom,
        scrollStep,
        minScroll: startTime,
        totalTime: totalTime,
        startTime: startTime,
        endTime: endTime,
        zeroMarkOffsetX: timelineLeftPadding,
      }),
    [
      endTime,
      maxZoom,
      minZoom,
      scrollStep,
      startTime,
      timelineLeftPadding,
      container,
      totalTime,
      zoomStep,
    ],
  );

  const scrollToZoom = useCallback(
    (prevTime: number, nextTime: number) => {
      const timeDiff = prevTime - nextTime;

      const pixelsDiff = timeDiff * timeline.hPixelsPerSecond;

      timeline.hScrollController.value += pixelsDiff;
    },
    [timeline],
  );

  const handleWheelZoom = useCallback(
    (delta: number) => {
      const isZoomIn = delta <= 0;

      if (audioEditor.isFitActivated || timeline.zoom < 1) {
        audioEditor.fit();
      }

      return isZoomIn
        ? timeline.zoomController.increase()
        : timeline.zoomController.decrease();
    },
    [audioEditor, timeline.zoom, timeline.zoomController],
  );

  const handleWheelHorizontalScroll = useCallback(
    (deltaX: number) => {
      timeline.hScrollController.shiftX(deltaX);
    },
    [timeline.hScrollController],
  );

  // Wheel event handler
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Zoom
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();

        const prevTime = timeline.globalToTime(e.pageX);

        timeline.zoomController.value;
        handleWheelZoom(e.deltaY);

        const nextTime = timeline.globalToTime(e.pageX);

        scrollToZoom(prevTime, nextTime);
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
    [handleWheelHorizontalScroll, handleWheelZoom, scrollToZoom, timeline],
  );

  // Zoom/scroll change listeners
  const handleZoomChange = useCallback(
    (zoom: number) => {
      onZoomChange?.(zoom, timeline.hPixelsPerSecond);
      onChange?.(
        zoom,
        timeline.hScrollController.value,
        timeline.hPixelsPerSecond,
      );
    },
    [
      onZoomChange,
      timeline.hPixelsPerSecond,
      timeline.hScrollController.value,
      onChange,
    ],
  );

  const handleScrollChange = useCallback(
    (scroll: number) => {
      onScrollChange?.(scroll, timeline.hPixelsPerSecond);
      onChange?.(
        timeline.zoomController.value,
        scroll,
        timeline.hPixelsPerSecond,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, onScrollChange],
  );

  // Setup listeners
  useEffect(() => {
    timeline.zoomController.addListener(handleZoomChange);

    return () => timeline.zoomController.removeListener(handleZoomChange);
  }, [onZoomChange, timeline.zoomController, handleZoomChange]);

  useEffect(() => {
    timeline.hScrollController.addListener(handleScrollChange);

    return () => timeline.hScrollController.removeListener(handleScrollChange);
  }, [handleScrollChange, timeline.hScrollController]);

  useEffect(() => {
    timeline.container = container.current;

    onZoomChange?.(timeline.zoomController.value, timeline.hPixelsPerSecond);
    onScrollChange?.(
      timeline.hScrollController.value,
      timeline.hPixelsPerSecond,
    );
    onChange?.(
      timeline.zoomController.value,
      timeline.hScrollController.value,
      timeline.hPixelsPerSecond,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, onScrollChange, onZoomChange, container]);

  // useEffect(() => {
  //   timeline.addWheelListener(handleWheel);

  //   return () => timeline.removeWheelListener(handleWheel);
  // }, [handleWheel, timeline]);

  // Setup wheel event handlers
  useWheel(handleWheel, container);
  useWheel(handleWheel, timelineRulerRef);

  return timeline;
};

'use client';

import { RefObject, useCallback, useEffect, useMemo } from 'react';

import { useWheel } from '@/shared/lib';

import {
  TIMELINE_LEFT_PADDING,
  Timeline,
  useAudioEditor,
} from '@/entities/audio-editor';

export interface TimelineZoomScrollProps {
  timelineRef: RefObject<HTMLDivElement>;
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
  timelineRef,
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
        timelineRef,
        zoomStep,
        minZoom,
        maxZoom,
        scrollStep,
        minScroll: startTime,
        totalTime: totalTime,
        startTime: startTime,
        endTime: endTime,
        timelineLeftPadding,
      }),
    [
      endTime,
      maxZoom,
      minZoom,
      scrollStep,
      startTime,
      timelineLeftPadding,
      timelineRef,
      totalTime,
      zoomStep,
    ],
  );

  const scrollToZoom = useCallback(
    (prevTime: number, nextTime: number) => {
      const timeDiff = prevTime - nextTime;

      const pixelsDiff = timeDiff * timeline.pixelsPerSecond;

      timeline.scrollController.value += pixelsDiff;
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
      timeline.scrollController.shiftX(deltaX);
    },
    [timeline.scrollController],
  );

  // Wheel event handler
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Zoom
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();

        const prevTime = timeline.mapGlobalToTime(e.pageX);

        timeline.zoomController.value;
        handleWheelZoom(e.deltaY);

        const nextTime = timeline.mapGlobalToTime(e.pageX);

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
      onZoomChange?.(zoom, timeline.timelineContainer.pixelsPerSecond);
      onChange?.(
        zoom,
        timeline.scrollController.value,
        timeline.timelineContainer.pixelsPerSecond,
      );
    },
    [
      onZoomChange,
      timeline.timelineContainer.pixelsPerSecond,
      timeline.scrollController.value,
      onChange,
    ],
  );

  const handleScrollChange = useCallback(
    (scroll: number) => {
      onScrollChange?.(scroll, timeline.timelineContainer.pixelsPerSecond);
      onChange?.(
        timeline.zoomController.value,
        scroll,
        timeline.timelineContainer.pixelsPerSecond,
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
    timeline.scrollController.addListener(handleScrollChange);

    return () => timeline.scrollController.removeListener(handleScrollChange);
  }, [handleScrollChange, timeline.scrollController]);

  useEffect(() => {
    timeline.timelineContainer.timelineRef = timelineRef;

    onZoomChange?.(
      timeline.zoomController.value,
      timeline.timelineContainer.pixelsPerSecond,
    );
    onScrollChange?.(
      timeline.scrollController.value,
      timeline.timelineContainer.pixelsPerSecond,
    );
    onChange?.(
      timeline.zoomController.value,
      timeline.scrollController.value,
      timeline.timelineContainer.pixelsPerSecond,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, onScrollChange, onZoomChange, timelineRef]);

  // useEffect(() => {
  //   timeline.addWheelListener(handleWheel);

  //   return () => timeline.removeWheelListener(handleWheel);
  // }, [handleWheel, timeline]);

  // Setup wheel event handlers
  useWheel(handleWheel, timelineRef);
  useWheel(handleWheel, timelineRulerRef);

  return timeline;
};

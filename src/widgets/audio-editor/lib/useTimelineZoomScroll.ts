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
  duration: number;
  zoomStep?: number;
  scrollStep?: number;
  minZoom?: number;
  maxZoom?: number;
  timelineLeftPadding?: number;
  onZoomChange?: (zoom: number, pixelsPerSecond: number) => void;
  onScrollChange?: (scroll: number, pixelsPerSecond: number) => void;
  onChange?: (zoom: number, scroll: number, pixelsPerSecond: number) => void;
}

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

export const useTimelineZoomScroll = ({
  timelineRef,
  timelineRulerRef,
  startTime = 0,
  duration,
  zoomStep = 1.25,
  scrollStep = 1,
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
        totalTime: duration,
        startTime: startTime,
        timelineLeftPadding,
      }),
    [
      duration,
      maxZoom,
      minZoom,
      scrollStep,
      startTime,
      timelineLeftPadding,
      timelineRef,
      zoomStep,
    ],
  );

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

      const x =
        e.pageX - timeline.boundingClientRect.x - timeline.timelineLeftPadding;

      timeline.scrollController.value = getScrollToAdjustZoomOffset(
        x,
        timeline.scrollController.value,
        timeline.zoomController.value,
        newZoom,
        timeline.timelineContainer.pixelsPerSecond,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline.scrollController, timeline.zoomController],
  );

  const handleWheelZoom = useCallback(
    (delta: number) => {
      const isZoomIn = delta <= 0;

      if (audioEditor.isFitActivated || timeline.zoom < 1) {
        audioEditor.fit();
      }

      isZoomIn
        ? timeline.zoomController.increase()
        : timeline.zoomController.decrease();
    },
    [audioEditor, timeline.zoom, timeline.zoomController],
  );

  const handleWheelHorizontalScroll = useCallback(
    (delta: number) => {
      const isScrollRight = delta >= 0;

      isScrollRight
        ? timeline.scrollController.increase({ behavior: 'smooth' })
        : timeline.scrollController.decrease({ behavior: 'smooth' });
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

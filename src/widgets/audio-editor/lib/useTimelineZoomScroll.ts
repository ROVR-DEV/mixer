'use client';

import { RefObject, useCallback, useEffect, useState } from 'react';

import { useWheel } from '@/shared/lib';

import {
  START_PAGE_X,
  TIMELINE_LEFT_PADDING,
  TimelineController,
} from '@/entities/audio-editor';

export interface TimelineZoomScrollProps {
  timelineRef: RefObject<HTMLDivElement>;
  timelineRulerRef: RefObject<HTMLDivElement>;
  playlistTotalTime: number;
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
  playlistTotalTime,
  zoomStep = 1.25,
  scrollStep = 50,
  minZoom = 1,
  maxZoom = Math.pow(1.25, 33),
  timelineLeftPadding = TIMELINE_LEFT_PADDING,
  onZoomChange,
  onScrollChange,
  onChange,
}: TimelineZoomScrollProps): TimelineController => {
  const [timelineController] = useState<TimelineController>(
    () =>
      new TimelineController({
        timelineRef,
        zoomStep,
        minZoom,
        maxZoom,
        scrollStep,
        minScroll: 0,
        totalTime: playlistTotalTime,
        timelineLeftPadding,
      }),
  );

  const scrollToZoom = useCallback(
    (e: WheelEvent) => {
      if (
        (timelineController.zoomController.value <= 1 && e.deltaY >= 0) ||
        (timelineController.zoomController.value >= Math.pow(1.25, 33) &&
          e.deltaY <= 0)
      ) {
        return;
      }

      const newZoom = timelineController.zoomController.rule(
        timelineController.zoomController.value,
        timelineController.zoomController.step,
        e.deltaY <= 0,
      );

      const x = e.pageX - START_PAGE_X - 5;

      timelineController.scrollController.value = getScrollToAdjustZoomOffset(
        x,
        timelineController.scrollController.value,
        timelineController.zoomController.value,
        newZoom,
        timelineController.timelineContainer.pixelsPerSecond,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      timelineController.scrollController,
      // timelineController.timelineContainer.pixelsPerSecond,
      timelineController.zoomController,
    ],
  );

  const handleWheelZoom = useCallback(
    (delta: number) => {
      const isZoomIn = delta <= 0;

      isZoomIn
        ? timelineController.zoomController.increase()
        : timelineController.zoomController.decrease();
    },
    [timelineController.zoomController],
  );

  const handleWheelHorizontalScroll = useCallback(
    (delta: number) => {
      const isScrollRight = delta >= 0;

      isScrollRight
        ? timelineController.scrollController.increase()
        : timelineController.scrollController.decrease();
    },
    [timelineController.scrollController],
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
      onZoomChange?.(
        zoom,
        timelineController.timelineContainer.pixelsPerSecond,
      );
      onChange?.(
        zoom,
        timelineController.scrollController.value,
        timelineController.timelineContainer.pixelsPerSecond,
      );
    },
    [
      onZoomChange,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.scrollController.value,
      onChange,
    ],
  );

  const handleScrollChange = useCallback(
    (scroll: number) => {
      onScrollChange?.(
        scroll,
        timelineController.timelineContainer.pixelsPerSecond,
      );
      onChange?.(
        timelineController.zoomController.value,
        scroll,
        timelineController.timelineContainer.pixelsPerSecond,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onChange,
      onScrollChange,
      // timelineController.timelineContainer.pixelsPerSecond,
      // timelineController.zoomController.value,
    ],
  );

  // Setup listeners
  useEffect(() => {
    timelineController.zoomController.addListener(handleZoomChange);

    return () =>
      timelineController.zoomController.removeListener(handleZoomChange);
  }, [onZoomChange, timelineController.zoomController, handleZoomChange]);

  useEffect(() => {
    timelineController.scrollController.addListener(handleScrollChange);

    return () =>
      timelineController.scrollController.removeListener(handleScrollChange);
  }, [handleScrollChange, timelineController.scrollController]);

  useEffect(() => {
    timelineController.timelineContainer.timelineRef = timelineRef;

    onZoomChange?.(
      timelineController.zoomController.value,
      timelineController.timelineContainer.pixelsPerSecond,
    );
    onScrollChange?.(
      timelineController.scrollController.value,
      timelineController.timelineContainer.pixelsPerSecond,
    );
    onChange?.(
      timelineController.zoomController.value,
      timelineController.scrollController.value,
      timelineController.timelineContainer.pixelsPerSecond,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onChange,
    onScrollChange,
    onZoomChange,
    // timelineController.scrollController.value,
    // timelineController.timelineContainer,
    // timelineController.zoomController.value,
    timelineRef,
  ]);

  useEffect(() => {
    timelineController.addWheelListener(handleWheel);

    return () => timelineController.removeWheelListener(handleWheel);
  }, [handleWheel, timelineController]);

  // Setup wheel event handlers
  useWheel(handleWheel, timelineRef);
  useWheel(handleWheel, timelineRulerRef);

  return timelineController;
};

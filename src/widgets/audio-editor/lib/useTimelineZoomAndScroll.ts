'use client';

import { clamp } from 'lodash-es';
import { RefObject, useCallback, useEffect, useRef } from 'react';

import { useWheel } from '@/shared/lib';

export interface TimelineZoomAndScrollProps {
  timelineRef: RefObject<HTMLDivElement>;
  timelineRulerRef: RefObject<HTMLDivElement>;
  zoomStep: number;
  scrollStep: number;
  minZoom: number;
  maxZoom: number;
  minScroll: number;
  maxScroll: number;
  onZoomChange?: (zoom: number) => void;
  onScrollChange?: (scroll: number) => void;
  onChange?: (zoom: number, scroll: number) => void;
}

export const useTimelineZoomAndScroll = ({
  timelineRef,
  timelineRulerRef,
  zoomStep,
  scrollStep,
  minZoom,
  maxZoom,
  minScroll,
  maxScroll,
  onZoomChange,
  onScrollChange,
  onChange,
}: TimelineZoomAndScrollProps): {
  zoomRef: RefObject<number>;
  scrollRef: RefObject<number>;
  setZoom: (zoom: number) => void;
  setScroll: (scroll: number) => void;
} => {
  const zoomRef = useRef(1);
  const scrollRef = useRef(0);

  const handleZoomChange = useCallback(
    (zoom: number) => {
      onZoomChange?.(zoom);
      onChange?.(zoom, scrollRef.current);

      // console.log('Z: ', scrollRef.current);
    },
    [onChange, onZoomChange],
  );

  const handleScrollChange = useCallback(
    (scroll: number) => {
      onScrollChange?.(scroll);
      onChange?.(zoomRef.current, scroll);
      // console.log('S: ', scroll);
    },
    [onChange, onScrollChange],
  );

  const clampZoom = useCallback(
    (value: number) => clamp(value, minZoom, maxZoom),
    [maxZoom, minZoom],
  );
  const clampScroll = useCallback(
    (value: number) => clamp(value, minScroll, maxScroll),
    [minScroll, maxScroll],
  );

  const setZoomProtected = useCallback(
    (zoom: number) => {
      zoomRef.current = clampZoom(zoom);
      handleZoomChange(zoomRef.current);
    },
    [clampZoom, handleZoomChange],
  );

  const setHorizontalScrollProtected = useCallback(
    (scroll: number) => {
      scrollRef.current = clampScroll(scroll);
      handleScrollChange(scrollRef.current);
    },
    [clampScroll, handleScrollChange],
  );

  const handleWheelZoom = useCallback(
    (delta: number) => {
      const isForward = delta <= 0;

      setZoomProtected(
        isForward ? zoomRef.current * zoomStep : zoomRef.current / zoomStep,
      );
    },
    [setZoomProtected, zoomStep],
  );

  const handleWheelHorizontalScroll = useCallback(
    (delta: number) => {
      const sign = delta >= 0 ? 1 : -1;
      setHorizontalScrollProtected(
        scrollRef.current + sign * (scrollStep / zoomRef.current),
      );
    },
    [scrollStep, setHorizontalScrollProtected],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        handleWheelZoom(e.deltaY);
        // scrollToZoom(e);
      }

      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleWheelHorizontalScroll(e.deltaY);
      } else if (e.deltaX) {
        e.preventDefault();
        e.stopPropagation();
        handleWheelHorizontalScroll(e.deltaX);
      }
    },
    [handleWheelHorizontalScroll, handleWheelZoom],
  );

  useEffect(() => {
    handleZoomChange(zoomRef.current);
  }, [handleZoomChange]);

  useWheel(handleWheel, timelineRef);
  useWheel(handleWheel, timelineRulerRef);

  return {
    zoomRef,
    scrollRef,
    setZoom: setZoomProtected,
    setScroll: setHorizontalScrollProtected,
  };
};

import { Dispatch, RefObject, SetStateAction, useMemo, useState } from 'react';

import { useWheel } from '@/shared/lib/useWheel';

import {
  STEP_IN_SECONDS_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { getByRanges } from './getByRanges';
import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

const setProtected = <T = number>(
  setFn: Dispatch<SetStateAction<T>>,
  value: SetStateAction<T>,
  bounds: (newState: T) => T,
) =>
  setFn((prevState) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prevState: T) => T)(prevState)
        : value;
    return bounds(newValue);
  });

export const useTimelineProperties = (
  timelineRef: RefObject<HTMLElement>,
  width: number,
  playlistTotalTime: number,
  shiftStep: number = 5,
  zoomRule: (prevZoom: number, sign: number) => number = (prevZoom, sign) =>
    sign > 0 ? prevZoom * 1.25 : prevZoom / 1.25,
) => {
  const [zoom, setZoomBase] = useState(1);
  const [shift, setShiftBase] = useState(0);

  const pixelsPerSecond = useMemo(() => {
    const range = getByRanges(zoom, STEP_IN_SECONDS_RANGES);
    const zoomStepBreakpoint = getByRanges(zoom, ZOOM_BREAKPOINT_RANGES);
    const tickSegmentWidth = getTickSegmentWidthZoomed(
      getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES).min,
      zoom,
      zoomStepBreakpoint,
    );
    return tickSegmentWidth / range;
  }, [zoom]);

  const realWidth = useMemo(
    () => Math.max(playlistTotalTime, 1440),
    [playlistTotalTime],
  );

  const shiftStepZoomed = shiftStep / zoom;
  const bufferWidth = width * 0.1;

  const setZoomProtected = (value: SetStateAction<number>) =>
    setProtected(setZoomBase, value, (newState) => {
      if (newState < 1) {
        return 1;
      } else if (newState > Math.pow(1.25, 33)) {
        return Math.pow(1.25, 33);
      } else {
        return newState;
      }
    });

  const setShiftProtected = (value: SetStateAction<number>) =>
    setProtected(setShiftBase, value, (newState) => {
      if (newState < 0) {
        return 0;
      } else if (newState >= realWidth - bufferWidth) {
        return Math.min(newState, realWidth - bufferWidth);
      } else {
        return newState;
      }
    });

  const handleZoom = (deltaY: number) => {
    const sign = deltaY >= 0 ? -1 : 1;
    setZoomProtected((prevState) => zoomRule(prevState, sign));
    setShiftProtected(shift);
  };

  const handleHorizontalScroll = (deltaY: number) => {
    const sign = deltaY >= 0 ? 1 : -1;
    setShiftProtected((prevState) => prevState + sign * shiftStepZoomed);
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      handleZoom(e.deltaY);
    }

    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleHorizontalScroll(e.deltaY);
    }
  };

  useWheel(handleWheel, timelineRef);

  return {
    zoom,
    shift,
    setZoom: setZoomProtected,
    setShift: setShiftProtected,
    pixelsPerSecond,
    realWidth,
  };
};

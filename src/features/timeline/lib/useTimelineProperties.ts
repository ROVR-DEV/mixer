import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { useWheel } from '@/shared/lib';

import {
  STEP_IN_SECONDS_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { getByRanges } from './getByRanges';
import { getDpi } from './getDpi';
import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

import { getRightTimelineBound } from '.';

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
  timelineRulerRef: RefObject<HTMLElement>,
  timelineClientWidth: number,
  playlistTotalTime: number,
  shiftStep: number = 5,
  paddingTimeSeconds: number,
  onShiftChange: (shift: number) => void,
  zoomRule: (prevZoom: number, sign: number) => number = (prevZoom, sign) =>
    sign > 0 ? prevZoom * 1.25 : prevZoom / 1.25,
) => {
  const [zoom, setZoomBase] = useState(1);
  const [shift, setShiftBase] = useState(0);
  const dpi = useMemo(() => getDpi(), []);

  const getPixelPerSeconds = useCallback((zoom: number) => {
    const range = getByRanges(zoom, STEP_IN_SECONDS_RANGES);
    const zoomStepBreakpoint = getByRanges(zoom, ZOOM_BREAKPOINT_RANGES);
    const tickSegmentWidth = getTickSegmentWidthZoomed(
      getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES).min,
      zoom,
      zoomStepBreakpoint,
    );
    return tickSegmentWidth / range;
  }, []);

  const pixelsPerSecond = useMemo(
    () => getPixelPerSeconds(zoom),
    [getPixelPerSeconds, zoom],
  );

  const timelineScrollWidth = useMemo(
    () =>
      Math.max(playlistTotalTime * pixelsPerSecond * dpi, timelineClientWidth),
    [dpi, pixelsPerSecond, playlistTotalTime, timelineClientWidth],
  );

  const shiftStepZoomed = shiftStep / zoom;

  const rightBound = getRightTimelineBound(
    timelineClientWidth,
    timelineScrollWidth,
  );

  const clampZoom = (value: number) => {
    if (value < 1) {
      return 1;
    } else if (value > Math.pow(1.25, 33)) {
      return Math.pow(1.25, 33);
    } else {
      return value;
    }
  };

  const clampShift = (value: number) => {
    if (value < 0) {
      return 0;
    } else if (value >= rightBound) {
      return Math.min(value, rightBound);
    } else {
      return value;
    }
  };

  const setZoomProtected = (value: SetStateAction<number>) =>
    setProtected(setZoomBase, value, clampZoom);

  const setShiftProtected = (value: SetStateAction<number>) =>
    setProtected(setShiftBase, value, clampShift);

  const handleZoom = (deltaY: number) => {
    const sign = deltaY >= 0 ? -1 : 1;
    setZoomProtected((prevState) => zoomRule(prevState, sign));
  };

  const handleHorizontalScroll = (deltaY: number) => {
    const sign = deltaY >= 0 ? 1 : -1;
    onShiftChange(clampShift(shift + sign * shiftStepZoomed));
    setShiftProtected((prevState) => prevState + sign * shiftStepZoomed);
  };

  const scrollToZoom = (e: WheelEvent) => {
    if (
      (zoom <= 1 && e.deltaY >= 0) ||
      (zoom >= Math.pow(1.25, 33) && e.deltaY <= 0)
    ) {
      return;
    }

    const sign = e.deltaY >= 0 ? -1 : 1;
    const newZoom = zoomRule(zoom, sign);
    const x = e.pageX - 296 - 5;

    const getNewShift = (prevState: number) => {
      const virtualShift = prevState * pixelsPerSecond;

      const currentVirtualX = virtualShift + x * zoom;
      const newVirtualX = virtualShift + x * newZoom;

      // eslint-disable-next-line no-console
      // console.log('X:', x, currentVirtualX, newVirtualX);

      const newPixelsPerSeconds = pixelsPerSecond * newZoom;

      return prevState + (newVirtualX - currentVirtualX) / newPixelsPerSeconds;
    };

    const newShift = getNewShift(shift);
    const clampedShift = clampShift(newShift);

    // eslint-disable-next-line no-console
    // console.log('Shift: ', newShift, clampedShift);

    onShiftChange(clampedShift);
    setShiftProtected(clampedShift);
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      handleZoom(e.deltaY);
      scrollToZoom(e);
    }

    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleHorizontalScroll(e.deltaY);
    } else if (e.deltaX) {
      e.preventDefault();
      e.stopPropagation();
      handleHorizontalScroll(e.deltaX);
    }
  };

  useWheel(handleWheel, timelineRef);
  useWheel(handleWheel, timelineRulerRef);

  return {
    zoom,
    shift,
    setZoom: setZoomProtected,
    setShift: setShiftProtected,
    pixelsPerSecond,
    timelineScrollWidth,
  };
};

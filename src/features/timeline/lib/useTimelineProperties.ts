import { Dispatch, RefObject, SetStateAction, useMemo, useState } from 'react';

import { useWheel } from '@/shared/lib';

import {
  STEP_IN_SECONDS_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { getByRanges } from './getByRanges';
import { getDpi } from './getDpi';
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
  timelineRulerRef: RefObject<HTMLElement>,
  timelineClientWidth: number,
  playlistTotalTime: number,
  shiftStep: number = 5,
  paddingTimeSeconds: number,
  zoomRule: (prevZoom: number, sign: number) => number = (prevZoom, sign) =>
    sign > 0 ? prevZoom * 1.25 : prevZoom / 1.25,
) => {
  const [zoom, setZoomBase] = useState(1);
  const [shift, setShiftBase] = useState(0);
  const dpi = useMemo(() => getDpi(), []);

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

  const timelineScrollWidth = useMemo(
    () =>
      Math.max(playlistTotalTime * pixelsPerSecond, timelineClientWidth) * dpi,
    [dpi, pixelsPerSecond, playlistTotalTime, timelineClientWidth],
  );

  const shiftStepZoomed = shiftStep / zoom;

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
      const rightBound =
        timelineScrollWidth / pixelsPerSecond -
        timelineClientWidth / pixelsPerSecond +
        paddingTimeSeconds;

      if (newState < 0) {
        return 0;
      } else if (newState >= rightBound) {
        return Math.min(newState, rightBound);
      } else {
        return newState;
      }
    });

  const handleZoom = (deltaY: number) => {
    const sign = deltaY >= 0 ? -1 : 1;
    setZoomProtected((prevState) => zoomRule(prevState, sign));
  };

  const handleHorizontalScroll = (deltaY: number) => {
    const sign = deltaY >= 0 ? 1 : -1;
    setShiftProtected((prevState) => prevState + sign * shiftStepZoomed);
  };

  const scrollToZoom = (e: WheelEvent) => {
    // setShiftProtected(shift);

    if (
      (zoom <= 1 && e.deltaY >= 0) ||
      (zoom >= Math.pow(1.25, 33) && e.deltaY <= 0)
    ) {
      return;
    }

    const percent = e.offsetX / timelineClientWidth;

    const sign = e.deltaY >= 0 ? -1 : 1;
    const sideSign = percent >= 0.5 ? 1 : -1;

    const newZoom = zoomRule(zoom, sign);

    if (sign === 1) {
      if (percent <= 0.1 || percent >= 0.9) {
        setShiftProtected((prevState) => prevState + sideSign * shiftStep);
      } else {
        const preciseSideSign =
          shift * pixelsPerSecond + timelineClientWidth / 2 <
          timelineScrollWidth / 2
            ? 1
            : -1;

        const widthDiff =
          (timelineScrollWidth * newZoom - timelineScrollWidth * zoom) /
          (pixelsPerSecond * newZoom) /
          (3.12 * zoom);

        setShiftProtected(
          (prevState) => prevState + preciseSideSign * widthDiff,
        );
      }
    } else {
      setShiftProtected(shift);
    }
  };
  // console.log(shift);

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

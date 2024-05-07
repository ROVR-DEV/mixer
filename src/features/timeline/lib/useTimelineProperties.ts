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

  const pixelsPerSecond = useMemo(() => {
    const range = getByRanges(zoom, STEP_IN_SECONDS_RANGES);
    const zoomStepBreakpoint = getByRanges(zoom, ZOOM_BREAKPOINT_RANGES);
    const tickSegmentWidth = getTickSegmentWidthZoomed(
      getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES).min,
      zoom,
      zoomStepBreakpoint,
    );
    // console.log(tickSegmentWidth);
    return tickSegmentWidth / range;
  }, [zoom]);

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
    if (value < 0) {
      return 0;
    } else if (value >= rightBound) {
      return Math.min(value, rightBound);
    } else {
      return value;
    }
  };

  const clampShift = (value: number) => {
    if (value < 1) {
      return 1;
    } else if (value > Math.pow(1.25, 33)) {
      return Math.pow(1.25, 33);
    } else {
      return value;
    }
  };

  const setZoomProtected = (value: SetStateAction<number>) =>
    setProtected(setZoomBase, value, clampShift);

  const setShiftProtected = (value: SetStateAction<number>) =>
    setProtected(setShiftBase, value, clampZoom);

  const handleZoom = (deltaY: number) => {
    const sign = deltaY >= 0 ? -1 : 1;
    setZoomProtected((prevState) => zoomRule(prevState, sign));
  };

  const handleHorizontalScroll = (deltaY: number) => {
    const sign = deltaY >= 0 ? 1 : -1;
    onShiftChange(clampShift(shift + sign * shiftStepZoomed));
    setShiftProtected((prevState) => prevState + sign * shiftStepZoomed);
  };
  // console.log(rightBound);

  // console.log(timelineScrollWidth);

  const scrollToZoom = useCallback(
    (e: WheelEvent) => {
      // setShiftProtected(shift);
      // console.log(rightBound);

      // console.log(e);

      if (
        (zoom <= 1 && e.deltaY >= 0) ||
        (zoom >= Math.pow(1.25, 33) && e.deltaY <= 0)
      ) {
        return;
      }

      // const percent = e.offsetX / timelineClientWidth;

      // const sign = e.deltaY >= 0 ? -1 : 1;
      // const sideSign = percent >= 0.5 ? 1 : -1;

      // const newZoom = zoomRule(zoom, sign);

      // const getNewShift = (prevShift: number) => {
      //   const pointX = (e.clientX - prevShift) / zoom;
      //   const newShift = e.clientX - pointX * newZoom;
      //   return -newShift;
      // };

      // onShiftChange(clampShift(getNewShift(shift)));
      // setShiftProtected(getNewShift);

      // if (sign === 1) {
      //   if (percent <= 0.1 || percent >= 0.9) {
      //     setShiftProtected((prevState) => prevState + sideSign * shiftStep);
      //   } else {
      //     const preciseSideSign =
      //       shift * pixelsPerSecond + timelineClientWidth / 2 <
      //       timelineScrollWidth / 2
      //         ? 1
      //         : -1;

      //     const widthDiff =
      //       (timelineScrollWidth * newZoom - timelineScrollWidth * zoom) /
      //       (pixelsPerSecond * newZoom) /
      //       (3.12 * zoom);

      //     setShiftProtected(
      //       (prevState) => prevState + preciseSideSign * widthDiff,
      //     );
      //   }
      // } else {
      //   setShiftProtected(shift);
      // }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoom],
  );
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

import { Dispatch, RefObject, SetStateAction, useState } from 'react';

import { useWheel } from '@/shared/lib/useWheel';

const setProtected = <T = number>(
  setFn: Dispatch<SetStateAction<T>>,
  value: SetStateAction<T>,
  bounds: (newState: T) => boolean,
) =>
  setFn((prevState) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prevState: T) => T)(prevState)
        : value;
    return bounds(newValue) ? newValue : prevState;
  });

export const useTimelineProperties = (timelineRef: RefObject<HTMLElement>) => {
  const [zoom, setZoomBase] = useState(1);
  const [shift, setShiftBase] = useState(0);

  const setZoomProtected = (value: SetStateAction<number>) =>
    setProtected(
      setZoomBase,
      value,
      (newState) => newState >= 1 && newState <= 24,
    );

  const setShiftProtected = (value: SetStateAction<number>) =>
    setProtected(
      setShiftBase,
      value,
      (newState) => newState >= 0 && newState <= 50,
    );

  const handleZoom = (deltaY: number) => {
    const sign = deltaY >= 0 ? -1 : 1;
    setZoomProtected((prevState) => prevState + sign * 0.25);
  };

  const handleHorizontalScroll = (deltaY: number) => {
    const sign = deltaY >= 0 ? 1 : -1;
    setShiftProtected((prevState) => prevState + 10 * sign);
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleHorizontalScroll(e.deltaY);
    }

    if (e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      handleZoom(e.deltaY);
    }
  };

  useWheel(handleWheel, timelineRef);

  return {
    zoom,
    shift,
    setZoom: setZoomProtected,
    setShift: setShiftProtected,
  };
};

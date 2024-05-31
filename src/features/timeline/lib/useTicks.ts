'use client';

import { useCallback, useRef } from 'react';

import { TimelineTicks } from '../model';

import { getTicksForSeconds } from './getTicksForSeconds';

export const useTicks = (visibleWidth: number) => {
  const ticksRef = useRef<TimelineTicks>();

  const updateTicks = useCallback(
    (zoom: number, scroll: number, pixelsPerSecond: number) => {
      ticksRef.current = getTicksForSeconds(
        visibleWidth,
        zoom,
        scroll * pixelsPerSecond,
      );
    },
    [visibleWidth],
  );

  return { ticksRef, updateTicks };
};

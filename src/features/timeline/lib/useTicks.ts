'use client';

import { useMemo } from 'react';

import { getTicksForSeconds } from './getTicksForSeconds';

export const useTicks = (visibleWidth: number, zoom: number, shift: number) => {
  return useMemo(
    () => getTicksForSeconds(visibleWidth, zoom, shift),
    [shift, visibleWidth, zoom],
  );
};

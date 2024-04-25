'use client';

import { useMemo } from 'react';

import { getTicksForSeconds } from './getTicksForSeconds';

export const useTicks = (width: number, zoom: number, shift: number) => {
  return useMemo(
    () => getTicksForSeconds(width, zoom, shift),
    [shift, width, zoom],
  );
};

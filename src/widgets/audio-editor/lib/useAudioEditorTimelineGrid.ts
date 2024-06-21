'use client';

import { RefObject, useCallback } from 'react';

import { resolvedTailwindConfig } from '@/shared/config';

import { TimelineGridRef, TimelineTicks } from '@/features/timeline';

const emptyTicks = { mainTicks: [], subTicks: [] };

export const renderDefaultTimelineGrid = (
  gridRef: RefObject<TimelineGridRef>,
  ticks: TimelineTicks | null,
  scroll: number,
  pixelsPerSecond: number,
  timelineLeftPadding: number,
) => {
  requestAnimationFrame(() => {
    gridRef.current?.render(
      ticks ?? emptyTicks,
      scroll * pixelsPerSecond,
      timelineLeftPadding,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resolvedTailwindConfig.theme.colors as any).grid.light,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resolvedTailwindConfig.theme.colors as any).grid.DEFAULT,
    );
  });
};

export const useAudioEditorTimelineGrid = (
  gridRef: RefObject<TimelineGridRef>,
) => {
  return useCallback(
    (
      ticks: TimelineTicks | null,
      scroll: number,
      pixelsPerSecond: number,
      timelineLeftPadding: number,
    ) => {
      renderDefaultTimelineGrid(
        gridRef,
        ticks,
        scroll,
        pixelsPerSecond,
        timelineLeftPadding,
      );
    },
    [gridRef],
  );
};

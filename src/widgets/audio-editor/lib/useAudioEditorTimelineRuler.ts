'use client';

import { RefObject, useCallback } from 'react';

import { resolvedTailwindConfig } from '@/shared/config';

import { TimelineRulerRef, TimelineTicks } from '@/features/timeline';

const emptyTicks = { mainTicks: [], subTicks: [] };

export const renderDefaultTimelineRuler = (
  rulerRef: RefObject<TimelineRulerRef>,
  ticks: TimelineTicks | null,
  zoom: number,
  scroll: number,
  pixelsPerSecond: number,
  timelineLeftPadding: number,
) =>
  requestAnimationFrame(() => {
    rulerRef.current?.render(
      ticks ?? emptyTicks,
      scroll * pixelsPerSecond,
      timelineLeftPadding,
      zoom,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resolvedTailwindConfig.theme.colors as any).third.DEFAULT,
    );
  });

export const useAudioEditorTimelineRuler = (
  rulerRef: RefObject<TimelineRulerRef>,
) => {
  return useCallback(
    (
      ticks: TimelineTicks | null,
      zoom: number,
      scroll: number,
      pixelsPerSecond: number,
      timelineLeftPadding: number,
    ) =>
      renderDefaultTimelineRuler(
        rulerRef,
        ticks,
        zoom,
        scroll,
        pixelsPerSecond,
        timelineLeftPadding,
      ),

    [rulerRef],
  );
};

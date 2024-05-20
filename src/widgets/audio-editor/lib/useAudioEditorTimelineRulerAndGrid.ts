'use client';

import { RefObject, useCallback, useRef } from 'react';

import {
  Tick,
  TimelineGridRef,
  TimelineRulerRef,
  getTicksForSeconds,
} from '@/features/timeline';

export interface AudioEditorTimelineRulerAndGridProps {
  rulerRef: RefObject<TimelineRulerRef>;
  gridRef: RefObject<TimelineGridRef>;
  timelineClientWidth: number;
  timelineLeftPadding: number;
}

export const useAudioEditorTimelineRulerAndGrid = ({
  rulerRef,
  gridRef,
  timelineClientWidth,
  timelineLeftPadding,
}: AudioEditorTimelineRulerAndGridProps) => {
  const ticksRef = useRef<{ mainTicks: Tick[]; subTicks: Tick[] }>();

  const updateTicks = useCallback(
    (zoom: number, scroll: number, pixelsPerSecond: number) => {
      ticksRef.current = getTicksForSeconds(
        timelineClientWidth,
        zoom,
        scroll * pixelsPerSecond,
      );
    },
    [timelineClientWidth],
  );

  const renderRuler = useCallback(
    (zoom: number, scroll: number, pixelsPerSecond: number) =>
      requestAnimationFrame(() => {
        rulerRef.current?.render(
          ticksRef.current ?? { mainTicks: [], subTicks: [] },
          scroll * pixelsPerSecond,
          timelineLeftPadding,
          zoom,
          '#9B9B9B',
        );
      }),
    [rulerRef, timelineLeftPadding],
  );

  const renderGrid = useCallback(
    (scroll: number, pixelsPerSecond: number) =>
      requestAnimationFrame(() => {
        gridRef.current?.render(
          ticksRef.current ?? { mainTicks: [], subTicks: [] },
          scroll * pixelsPerSecond,
          timelineLeftPadding,
          '#555555',
          '#2D2D2D',
        );
      }),
    [gridRef, timelineLeftPadding],
  );

  return { renderRuler, renderGrid, updateTicks, ticksRef };
};

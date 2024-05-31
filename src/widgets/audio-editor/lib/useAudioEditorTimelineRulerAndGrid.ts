'use client';

import { RefObject, useCallback } from 'react';

import {
  TimelineGridRef,
  TimelineRulerRef,
  TimelineTicks,
  useTicks,
} from '@/features/timeline';

import { useAudioEditorTimelineGrid } from './useAudioEditorTimelineGrid';
import { useAudioEditorTimelineRuler } from './useAudioEditorTimelineRuler';

export interface AudioEditorTimelineRulerAndGridProps {
  rulerRef: RefObject<TimelineRulerRef>;
  gridRef: RefObject<TimelineGridRef>;
  timelineClientWidth: number;
}

const emptyTicks: TimelineTicks = { mainTicks: [], subTicks: [] };

export const useAudioEditorTimelineRulerAndGrid = ({
  rulerRef,
  gridRef,
  timelineClientWidth,
}: AudioEditorTimelineRulerAndGridProps) => {
  const { ticksRef, updateTicks } = useTicks(timelineClientWidth);

  const renderRuler = useAudioEditorTimelineRuler(rulerRef);
  const renderGrid = useAudioEditorTimelineGrid(gridRef);

  const renderRulerWithTicks = useCallback(
    (
      zoom: number,
      scroll: number,
      pixelsPerSecond: number,
      timelineLeftPadding: number,
    ) =>
      renderRuler(
        ticksRef.current ?? emptyTicks,
        zoom,
        scroll,
        pixelsPerSecond,
        timelineLeftPadding,
      ),
    [renderRuler, ticksRef],
  );

  const renderGridWithTicks = useCallback(
    (scroll: number, pixelsPerSecond: number, timelineLeftPadding: number) =>
      renderGrid(
        ticksRef.current ?? emptyTicks,
        scroll,
        pixelsPerSecond,
        timelineLeftPadding,
      ),
    [renderGrid, ticksRef],
  );

  return {
    renderRuler: renderRulerWithTicks,
    renderGrid: renderGridWithTicks,
    updateTicks,
    ticksRef,
  };
};

'use client';

import { RefObject, useRef, useState } from 'react';

import { useDpi } from '@/shared/lib';

import { getPixelPerSeconds } from '@/features/timeline';

import { useTimelineWidth } from './useTimelineWidth';
import { useTimelineZoomAndScroll } from './useTimelineZoomAndScroll';

export interface AudioEditorTimelineProps {
  timelineRef: RefObject<HTMLDivElement>;
  timelineRulerRef: RefObject<HTMLDivElement>;
  playlistTotalTime: number;
  zoomStep?: number;
  scrollStep?: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number, pixelsPerSecond: number) => void;
  onScrollChange?: (scroll: number, pixelsPerSecond: number) => void;
  onChange?: (zoom: number, scroll: number, pixelsPerSecond: number) => void;
}

export const useAudioEditorViewProperties = ({
  timelineRef,
  timelineRulerRef,
  playlistTotalTime,
  zoomStep = 1.25,
  scrollStep = 50,
  minZoom = 1,
  maxZoom = Math.pow(1.25, 33),
  onZoomChange,
  onScrollChange,
  onChange,
}: AudioEditorTimelineProps) => {
  const [pixelsPerSecond, setPixelsPerSeconds] = useState<number>(1);
  const pixelsPerSecondRef = useRef(pixelsPerSecond);

  const dpi = useDpi();
  const { timelineClientWidth, timelineScrollWidth, minScroll, maxScroll } =
    useTimelineWidth(timelineRef, playlistTotalTime, pixelsPerSecond, dpi);

  const handleZoomChange = (zoom: number) => {
    pixelsPerSecondRef.current = getPixelPerSeconds(zoom);
    setPixelsPerSeconds(pixelsPerSecondRef.current);
    onZoomChange?.(zoom, pixelsPerSecondRef.current);
  };

  const handleScrollChange = (scroll: number) => {
    onScrollChange?.(scroll, pixelsPerSecondRef.current);
  };

  const handleChange = (zoom: number, scroll: number) => {
    onChange?.(zoom, scroll, pixelsPerSecondRef.current);
  };

  const { zoomRef, scrollRef, setZoom, setScroll } = useTimelineZoomAndScroll({
    timelineRef,
    timelineRulerRef,
    zoomStep,
    scrollStep,
    minZoom,
    maxZoom,
    minScroll,
    maxScroll,
    pixelsPerSecond,
    onScrollChange: handleScrollChange,
    onZoomChange: handleZoomChange,
    onChange: handleChange,
  });

  return {
    timelineClientWidth,
    timelineScrollWidth,
    pixelsPerSecond,
    zoomRef,
    scrollRef,
    setZoom,
    setScroll,
  };
};

'use client';

import { RefObject, useEffect, useState } from 'react';

import {
  TIMELINE_LEFT_PADDING,
  Timeline,
  initializeTimeline,
} from '@/entities/audio-editor';

export interface TimelineInitializeProps {
  timelineRef: RefObject<HTMLDivElement>;
  zoomStep?: number;
  scrollStep?: number;
  minZoom?: number;
  maxZoom?: number;
  // Explicit set total time
  totalTime?: number;
  startTime?: number;
  endTime: number;
  zeroMarkOffsetX?: number;
  trackHeight?: number | string;
}

export const useTimelineInitialize = (
  key: string,
  {
    timelineRef,
    totalTime,
    startTime = 0,
    endTime,
    zoomStep = 1.25,
    scrollStep = 100, // Default chrome scroll step
    minZoom = 1,
    maxZoom = Math.pow(1.25, 33),
    zeroMarkOffsetX = TIMELINE_LEFT_PADDING,
    trackHeight,
  }: TimelineInitializeProps,
): Timeline => {
  const [timeline] = useState(() =>
    initializeTimeline(key, {
      container: timelineRef.current,
      zoomStep,
      minZoom,
      maxZoom,
      scrollStep,
      minScroll: startTime,
      totalTime,
      startTime,
      endTime,
      zeroMarkOffsetX,
      trackHeight,
    }),
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      timeline.setupObservers();
      return () => timeline.cleanupObservers();
    }
  }, [timeline]);

  useEffect(() => {
    timeline.container = timelineRef.current;
  }, [timeline, timelineRef]);

  useEffect(() => {
    if (timeline.zoomController.min !== minZoom) {
      timeline.zoomController.min = minZoom;
    }

    if (timeline.zoomController.max !== maxZoom) {
      timeline.zoomController.max = maxZoom;
    }

    if (timeline.zoomController.step !== zoomStep) {
      timeline.zoomController.step = zoomStep;
    }
  }, [maxZoom, minZoom, timeline, zoomStep]);

  useEffect(() => {
    if (timeline.hScrollController.step !== scrollStep) {
      timeline.hScrollController.step = scrollStep;
    }
  }, [scrollStep, timeline]);

  useEffect(() => {
    if (totalTime && timeline.totalTime !== totalTime) {
      timeline.totalTime = totalTime;
    }
  }, [timeline, startTime, totalTime]);

  useEffect(() => {
    if (timeline.startTime !== startTime) {
      timeline.startTime = startTime;
    }
  }, [timeline, startTime]);

  useEffect(() => {
    if (timeline.endTime !== endTime) {
      timeline.endTime = endTime;
    }

    if (!totalTime) {
      timeline.totalTime = endTime + 6;
    }
  }, [timeline, endTime, totalTime]);

  useEffect(() => {
    if (timeline.zeroMarkOffsetX !== zeroMarkOffsetX) {
      timeline.zeroMarkOffsetX = zeroMarkOffsetX;
    }
  }, [timeline, zeroMarkOffsetX]);

  useEffect(() => {
    if (trackHeight && timeline.trackHeight !== trackHeight) {
      timeline.trackHeight = trackHeight;
    }
  }, [timeline, trackHeight]);

  return timeline;
};

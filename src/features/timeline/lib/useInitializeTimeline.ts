'use client';

import { useEffect, useState } from 'react';

import {
  ObservableTimeline,
  Timeline2,
  Timeline2Props,
  // useAudioEditor,
} from '@/entities/audio-editor';

import { ZOOM_STEP } from '../config';

export interface UseInitializeTimelineProps
  extends Omit<
      Timeline2Props,
      'zoomControllerProps' | 'hScrollControllerProps'
    >,
    Partial<
      Pick<Timeline2Props, 'zoomControllerProps' | 'hScrollControllerProps'>
    > {}

export const useInitializeTimeline = ({
  timelineElement = null,

  startTime = 0,
  endTime,

  zeroMarkOffsetPx = 0,

  trackHeight = null,

  zoomControllerProps = {
    min: 1,
    max: Math.pow(ZOOM_STEP, 33),
    step: ZOOM_STEP,
  },
  hScrollControllerProps,
}: UseInitializeTimelineProps): Timeline2 => {
  // const audioEditor = useAudioEditor();

  const timeline = useState(
    () =>
      new ObservableTimeline({
        timelineElement,
        startTime,
        endTime,
        zeroMarkOffsetPx,
        trackHeight,
        zoomControllerProps,
        hScrollControllerProps: {
          step: hScrollControllerProps?.step || 50,
          ...hScrollControllerProps,
        },
      }),
  )[0];

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    timeline.setupObservers();

    return () => timeline.cleanupObservers();
  }, [timeline]);

  useEffect(() => {
    timeline.timelineElement = timelineElement;
  }, [timeline, timelineElement]);

  useEffect(() => {
    timeline.startTime = startTime;
  }, [timeline, startTime]);

  useEffect(() => {
    timeline.endTime = endTime;
  }, [timeline, endTime]);

  useEffect(() => {
    timeline.zeroMarkOffset = zeroMarkOffsetPx;
  }, [timeline, zeroMarkOffsetPx]);

  useEffect(() => {
    if (trackHeight !== undefined) {
      timeline.trackHeight = trackHeight;
    }
  }, [timeline, trackHeight]);

  useEffect(() => {
    if (zoomControllerProps.min !== timeline.zoomController.min) {
      timeline.zoomController.min;
    }

    if (zoomControllerProps.max !== timeline.zoomController.max) {
      timeline.zoomController.max;
    }

    if (zoomControllerProps.step !== timeline.zoomController.step) {
      timeline.zoomController.step;
    }
  }, [
    timeline,
    zoomControllerProps.max,
    zoomControllerProps.min,
    zoomControllerProps.step,
  ]);

  useEffect(() => {
    if (hScrollControllerProps?.min !== timeline.hScrollController.min) {
      timeline.hScrollController.min;
    }

    if (hScrollControllerProps?.max !== timeline.hScrollController.max) {
      timeline.hScrollController.max;
    }

    if (hScrollControllerProps?.step !== timeline.hScrollController.step) {
      timeline.hScrollController.step;
    }
  }, [
    timeline,
    hScrollControllerProps?.min,
    hScrollControllerProps?.max,
    hScrollControllerProps?.step,
  ]);

  // To prevent linter collapse return statement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const a = 2;

  return timeline;
};

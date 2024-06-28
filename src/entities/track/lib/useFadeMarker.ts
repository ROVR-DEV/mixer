'use client';

import { throttle } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clamp,
  preventAll,
  removeDragGhostImage,
  stopPropagation,
  useListener,
} from '@/shared/lib';

import {
  TimelineController,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, AudioEditorTrack, Side } from '../model';

import { getFadeMarkerAriaAttributes } from './fadeMarkerAria';
import { getGlobalBounds } from './getBounds';

export interface UseFadeMarkerProps {
  side: FadeSide;
  track: AudioEditorTrack | null;
  timelineController: TimelineController;
}

const setFade = throttle(
  (track: AudioEditorTrack, time: number, side: Side) => {
    if (!track?.filters) {
      throw new Error('Editable track not found');
    }

    const trackRelativeTime = time - track.startTime;

    if (side === 'left') {
      track?.filters.fadeInNode.linearFadeIn(
        track.startTrimDuration,
        trackRelativeTime - track.startTrimDuration,
      );
    } else if (side === 'right') {
      track?.filters.fadeOutNode.linearFadeOut(
        trackRelativeTime,
        track.duration - track.endTrimDuration - trackRelativeTime,
      );
    }
  },
);

export const useFadeMarker = ({
  side,
  track,
  timelineController,
}: UseFadeMarkerProps): {
  width: number;
  fadeMarkerProps: React.ComponentPropsWithoutRef<'div'>;
} => {
  const getMarkerStartTime = useCallback(
    () =>
      side === 'left'
        ? (track?.filters?.fadeInNode.endTime ?? 0) -
          (track?.startTrimDuration ?? 0)
        : (track?.filters?.fadeOutNode.startTime ?? 0) -
          (track?.startTrimDuration ?? 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const currentTime = useMemo(
    () => getMarkerStartTime(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getMarkerStartTime,
      track?.filters?.fadeInNode.endTime,
      track?.filters?.fadeOutNode.startTime,
      track?.startTrimDuration,
      track?.endTrimDuration,
    ],
  );

  const ariaAttributes = useMemo(
    () =>
      getFadeMarkerAriaAttributes(track?.trimDuration ?? 0, side, currentTime),
    [currentTime, side, track?.trimDuration],
  );

  const clampTime = useCallback(
    (time: number) => {
      const { leftBound, rightBound } = getGlobalBounds(track, side);
      return clamp(time, leftBound, rightBound);
    },
    [side, track],
  );

  const [width, setWidth] = useState(
    timelineController.timeToVirtualPixels(getMarkerStartTime()),
  );

  const updateWidth = useCallback(() => {
    if (!track) {
      return;
    }

    const startTime = getMarkerStartTime();

    setWidth(
      timelineController.timeToVirtualPixels(
        clamp(side === 'left' ? startTime : track.trimDuration - startTime, 0),
      ),
    );
  }, [getMarkerStartTime, side, timelineController, track]);

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!track?.filters) {
        return;
      }

      const time = clampTime(timelineController.virtualPixelsToTime(e.pageX));
      setFade(track, time, side);
    },
    [clampTime, side, timelineController, track],
  );

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    removeDragGhostImage(e);
  }, []);

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      handleDrag(e);
    },
    [handleDrag],
  );

  useEffect(() => {
    updateWidth();
  }, [
    track?.filters?.fadeInNode.endTime,
    track?.filters?.fadeOutNode.startTime,
    updateWidth,
  ]);

  useListener(
    timelineController.zoomController.addListener,
    timelineController.zoomController.removeListener,
    updateWidth,
  );

  return {
    width,
    fadeMarkerProps: {
      draggable: true,
      onDrag: handleDrag,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: preventAll,
      onDrop: preventAll,
      onMouseDown: stopPropagation,
      onMouseUp: stopPropagation,
      ...ariaAttributes,
    },
  };
};

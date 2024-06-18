'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clamp,
  preventAll,
  removeDragGhostImage,
  useListener,
} from '@/shared/lib';

import {
  TimelineController,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, TrackWithMeta } from '../model';

import { getFadeMarkerStartAriaAttributes } from './fadeMarkerAria';
import { getGlobalBounds } from './getBounds';

export interface UseFadeMarkerProps {
  side: FadeSide;
  track: TrackWithMeta | null;
  timelineController: TimelineController;
}

export const useFadeMarker = ({
  side,
  track,
  timelineController,
}: UseFadeMarkerProps): {
  position: number;
  fadeMarkerProps: React.ComponentPropsWithoutRef<'div'>;
} => {
  const getMarkerStartTime = useCallback(
    () =>
      side === 'left'
        ? (track?.trackAudioFilters?.fadeInNode.endTime ?? 0) -
          (track?.startTimeOffset ?? 0)
        : (track?.trackAudioFilters?.fadeOutNode.startTime ?? 0) -
          (track?.startTimeOffset ?? 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const currentTime = useMemo(
    () => getMarkerStartTime(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getMarkerStartTime,
      track?.trackAudioFilters?.fadeInNode.endTime,
      track?.trackAudioFilters?.fadeOutNode.startTime,
      track?.startTimeOffset,
      track?.endTimeOffset,
    ],
  );

  const ariaAttributes = useMemo(
    () =>
      getFadeMarkerStartAriaAttributes(
        track?.visibleDuration ?? 0,
        side,
        currentTime,
      ),
    [currentTime, side, track?.visibleDuration],
  );

  const clampTime = useCallback(
    (time: number) => {
      const { leftBound, rightBound } = getGlobalBounds(track, side);
      return clamp(time, leftBound, rightBound);
    },
    [side, track],
  );

  const timeToPosition = useCallback(
    (time: number) => {
      return (
        timelineController.realToVirtualPixels(time) +
        timelineController.timelineLeftPadding
      );
    },
    [timelineController],
  );

  const positionToTime = useCallback(
    (pageX: number) => {
      const time = timelineController.realLocalPixelsToGlobal(
        timelineController.virtualToRealPixels(
          pageX - timelineController.startPageX,
        ),
      );

      return clampTime(time);
    },
    [clampTime, timelineController],
  );

  const [position, setPosition] = useState(
    timeToPosition(getMarkerStartTime()),
  );

  const updatePosition = useCallback(() => {
    setPosition(timeToPosition(getMarkerStartTime()));
  }, [getMarkerStartTime, timeToPosition]);

  const setFade = useCallback(
    (time: number) => {
      if (!track?.trackAudioFilters) {
        throw new Error('Editable track not found');
      }

      const trackRelativeTime = time - track.startTime;

      if (side === 'left') {
        track?.trackAudioFilters.fadeInNode.linearFadeIn(
          track.startTimeOffset,
          trackRelativeTime - track.startTimeOffset,
        );
      } else if (side === 'right') {
        track?.trackAudioFilters.fadeOutNode.linearFadeOut(
          trackRelativeTime,
          track.duration - track.endTimeOffset - trackRelativeTime,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!track?.trackAudioFilters) {
        return;
      }

      const time = positionToTime(e.pageX);
      setFade(time);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positionToTime, side],
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
    updatePosition();
  }, [
    track?.trackAudioFilters?.fadeInNode.endTime,
    track?.trackAudioFilters?.fadeOutNode.startTime,
    updatePosition,
  ]);

  useListener(
    timelineController.zoomController.addListener,
    timelineController.zoomController.removeListener,
    updatePosition,
  );

  return {
    position,
    fadeMarkerProps: {
      draggable: true,
      onDrag: handleDrag,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: preventAll,
      onDrop: preventAll,
      ...ariaAttributes,
    },
  };
};
